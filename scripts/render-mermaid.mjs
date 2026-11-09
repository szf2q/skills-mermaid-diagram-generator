#!/usr/bin/env node
/**
 * Mermaid 批量渲染脚本（mermaid-diagram-generator 技能自带）
 *
 * 职责：
 * 1. 接收一个或多个 .mmd 文件或目录；
 * 2. 自动探测 mermaid-cli（mmdc）与 Chrome/Chromium；
 * 3. 为每个 .mmd 生成同名 .png，默认输出到源文件所在目录；
 * 4. 汇总成功/失败数量，任一失败则以非 0 退出码结束。
 *
 * 用法：
 *   node render-mermaid.mjs <文件或目录...> [选项]
 *
 * 选项：
 *   -o, --out <dir>        PNG 输出目录（默认与 .mmd 同目录）
 *   --scale <n>            输出缩放倍数（默认 2）
 *   --width <px>           画布宽度（默认 1600）
 *   --theme <name>         default | dark | forest | neutral（默认 default）
 *   --background <color>   背景色（默认 white）
 *   --css <file>           自定义 CSS 文件
 *   --recursive            递归处理子目录
 *   --check                仅检查运行环境
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

/** 当前脚本所在目录，用于定位技能自带依赖。 */
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
/** 技能根目录（scripts 的上一级）。 */
const SKILL_ROOT = path.resolve(SCRIPT_DIR, '..');
/** 单张图渲染超时时间（毫秒）。 */
const RENDER_TIMEOUT_MS = 180_000;
/** 允许的主题集合，避免把非法值传给 mmdc。 */
const ALLOWED_THEMES = new Set(['default', 'dark', 'forest', 'neutral']);

/**
 * 输出普通日志。
 * @param {string} message 日志内容
 */
function log(message) {
  process.stdout.write(`${message}\n`);
}

/**
 * 输出错误日志到标准错误。
 * @param {string} message 错误内容
 */
function logError(message) {
  process.stderr.write(`${message}\n`);
}

/**
 * 将命令行参数解析为结构化配置。
 * @param {string[]} argv 去除 node 与脚本路径后的参数数组
 * @returns {{inputs: string[], out: string|null, scale: number, width: number, theme: string, background: string, css: string|null, recursive: boolean, check: boolean, help: boolean}}
 */
function parseArgs(argv) {
  const options = {
    inputs: [],
    out: null,
    scale: 2,
    width: 1600,
    theme: 'default',
    background: 'white',
    css: null,
    recursive: false,
    check: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '-o':
      case '--out':
        options.out = expectValue(argv, ++i, arg);
        break;
      case '--scale':
        options.scale = toPositiveNumber(expectValue(argv, ++i, arg), arg);
        break;
      case '--width':
        options.width = toPositiveNumber(expectValue(argv, ++i, arg), arg);
        break;
      case '--theme':
        options.theme = expectValue(argv, ++i, arg);
        break;
      case '--background':
        options.background = expectValue(argv, ++i, arg);
        break;
      case '--css':
        options.css = expectValue(argv, ++i, arg);
        break;
      case '--recursive':
        options.recursive = true;
        break;
      case '--check':
        options.check = true;
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
        // 以 - 开头且未识别的参数视为错误，其余视为输入路径
        if (arg.startsWith('-')) {
          throw new Error(`未知参数：${arg}`);
        }
        options.inputs.push(arg);
        break;
    }
  }

  if (!ALLOWED_THEMES.has(options.theme)) {
    throw new Error(`不支持的主题：${options.theme}，可选值：${[...ALLOWED_THEMES].join(' / ')}`);
  }
  return options;
}

/**
 * 读取选项后面的值，缺失时抛出可读错误。
 * @param {string[]} argv 参数数组
 * @param {number} index 值所在下标
 * @param {string} option 选项名，用于错误提示
 * @returns {string} 选项值
 */
function expectValue(argv, index, option) {
  const value = argv[index];
  if (!value || value.startsWith('-')) {
    throw new Error(`参数 ${option} 缺少取值`);
  }
  return value;
}

/**
 * 将字符串转换为正整数。
 * @param {string} value 原始值
 * @param {string} option 选项名，用于错误提示
 * @returns {number} 转换后的正整数
 */
function toPositiveNumber(value, option) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`参数 ${option} 必须为正数，当前值：${value}`);
  }
  return parsed;
}

/**
 * 检查文件是否存在且为普通文件。
 * @param {string} filePath 待检查路径
 * @returns {boolean} 是否为存在的普通文件
 */
function isFile(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * 探测 mermaid-cli 可执行方式。
 * 优先使用环境变量、项目依赖、全局命令；都不可用时退回 npx 临时执行。
 * @returns {{command: string, prefixArgs: string[], label: string}} 可执行命令与前置参数
 */
function findMmdc() {
  if (process.env.MMDC_BIN && isFile(process.env.MMDC_BIN)) {
    return { command: process.env.MMDC_BIN, prefixArgs: [], label: process.env.MMDC_BIN };
  }

  const localBinary = path.join(
    SKILL_ROOT,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'mmdc.cmd' : 'mmdc',
  );
  if (isFile(localBinary)) {
    return { command: localBinary, prefixArgs: [], label: localBinary };
  }

  const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['mmdc'], {
    encoding: 'utf8',
  });
  if (probe.status === 0 && probe.stdout.trim()) {
    const binary = probe.stdout.trim().split(/\r?\n/)[0];
    return { command: binary, prefixArgs: [], label: binary };
  }

  return {
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    prefixArgs: ['-y', '@mermaid-js/mermaid-cli'],
    label: 'npx @mermaid-js/mermaid-cli',
  };
}

/**
 * 在常见安装位置与 Puppeteer 缓存中探测 Chrome/Chromium。
 * @returns {string|null} 可执行文件绝对路径，未找到时返回 null
 */
function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (isFile(candidate)) {
      return candidate;
    }
  }

  // 扫描 Puppeteer 缓存目录：~/.cache/puppeteer/chrome/<version>/chrome-<platform>/chrome
  const cacheRoot = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome');
  if (existsSync(cacheRoot)) {
    for (const version of readdirSync(cacheRoot)) {
      const versionDir = path.join(cacheRoot, version);
      if (!existsSync(versionDir)) continue;
      for (const platform of readdirSync(versionDir)) {
        const base = path.join(versionDir, platform);
        const executable = path.join(
          base,
          platform.startsWith('win') ? 'chrome.exe' : platform.startsWith('mac') ? 'Chromium.app/Contents/MacOS/Chromium' : 'chrome',
        );
        if (isFile(executable)) {
          return executable;
        }
      }
    }
  }
  return null;
}

/**
 * 探测 mermaid-cli 主版本号。
 * mermaid-cli 12 起移除了 `-w/--width`，改用 `--size`，需要按版本选择参数。
 * @param {{command: string, prefixArgs: string[], label: string}} mmdc mermaid-cli 执行方式
 * @returns {number} 主版本号；无法解析时返回 0
 */
function detectMmdcMajorVersion(mmdc) {
  const result = spawnSync(mmdc.command, [...mmdc.prefixArgs, '--version'], {
    encoding: 'utf8',
    timeout: 30_000,
  });
  if (result.status !== 0) {
    return 0;
  }
  const match = (result.stdout || '').match(/(\d+)\.\d+\.\d+/);
  return match ? Number(match[1]) : 0;
}

/**
 * 生成 Puppeteer 配置文件，确保容器环境可以无沙箱启动 Chrome。
 * @param {string|null} chromePath Chrome 可执行文件路径
 * @returns {{configPath: string, cleanup: () => void}} 配置文件路径与清理函数
 */
function createPuppeteerConfig(chromePath) {
  const tempDir = path.join(os.tmpdir(), `mermaid-render-${process.pid}`);
  mkdirSync(tempDir, { recursive: true });
  const configPath = path.join(tempDir, 'puppeteer-config.json');
  const config = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
  if (chromePath) {
    config.executablePath = chromePath;
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  return {
    configPath,
    cleanup: () => rmSync(tempDir, { recursive: true, force: true }),
  };
}

/**
 * 展开输入路径，收集所有待渲染的 .mmd 文件。
 * @param {string[]} inputs 文件或目录路径
 * @param {boolean} recursive 是否递归遍历子目录
 * @returns {string[]} 去重后的 .mmd 绝对路径列表
 */
function collectMmdFiles(inputs, recursive) {
  const files = new Set();

  /**
   * 递归遍历目录并收集 .mmd 文件。
   * @param {string} dir 目录路径
   */
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        if (recursive) walk(fullPath);
      } else if (entry.toLowerCase().endsWith('.mmd')) {
        files.add(path.resolve(fullPath));
      }
    }
  };

  for (const input of inputs) {
    const resolved = path.resolve(input);
    if (!existsSync(resolved)) {
      throw new Error(`输入路径不存在：${resolved}`);
    }
    if (statSync(resolved).isDirectory()) {
      walk(resolved);
    } else if (resolved.toLowerCase().endsWith('.mmd')) {
      files.add(resolved);
    } else {
      throw new Error(`输入文件不是 .mmd 文件：${resolved}`);
    }
  }

  return [...files].sort();
}

/**
 * 渲染单个 Mermaid 文件。
 * @param {{command: string, prefixArgs: string[], label: string}} mmdc mermaid-cli 执行方式
 * @param {string} input .mmd 文件绝对路径
 * @param {string} output .png 输出路径
 * @param {object} options 渲染选项
 * @param {string} puppeteerConfig Puppeteer 配置文件路径
 * @param {number} mmdcMajor mermaid-cli 主版本号，用于选择宽度参数
 * @returns {{ok: boolean, error?: string}} 渲染结果
 */
function renderOne(mmdc, input, output, options, puppeteerConfig, mmdcMajor) {
  mkdirSync(path.dirname(output), { recursive: true });

  // mermaid-cli 12+ 使用 --size，旧版本使用 -w/--width
  const widthArgs = mmdcMajor >= 12
    ? ['--size', String(options.width)]
    : ['-w', String(options.width)];

  const args = [
    ...mmdc.prefixArgs,
    '-i',
    input,
    '-o',
    output,
    ...widthArgs,
    '-s',
    String(options.scale),
    '-b',
    options.background,
    '-t',
    options.theme,
    '-p',
    puppeteerConfig,
  ];
  if (options.css) {
    args.push('-C', path.resolve(options.css));
  }

  const result = spawnSync(mmdc.command, args, {
    encoding: 'utf8',
    timeout: RENDER_TIMEOUT_MS,
    env: { ...process.env },
  });

  if (result.error) {
    return { ok: false, error: `启动 mermaid-cli 失败：${result.error.message}` };
  }
  if (result.status !== 0) {
    const detail = `${result.stderr || ''}\n${result.stdout || ''}`.trim().slice(-2000);
    return { ok: false, error: `mermaid-cli 退出码 ${result.status}\n${detail}` };
  }
  if (!isFile(output) || statSync(output).size === 0) {
    return { ok: false, error: `未生成有效的 PNG：${output}` };
  }
  return { ok: true };
}

/**
 * 打印帮助信息。
 */
function printHelp() {
  log(`用法：node render-mermaid.mjs <文件或目录...> [选项]

选项：
  -o, --out <dir>        PNG 输出目录（默认与 .mmd 同目录）
  --scale <n>            输出缩放倍数（默认 2）
  --width <px>           画布宽度（默认 1600）
  --theme <name>         default | dark | forest | neutral（默认 default）
  --background <color>   背景色（默认 white）
  --css <file>           自定义 CSS 文件
  --recursive            递归处理子目录
  --check                仅检查运行环境
  -h, --help             显示帮助`);
}

/**
 * 检查并打印运行环境信息。
 * @param {{command: string, prefixArgs: string[], label: string}} mmdc mermaid-cli 执行方式
 * @param {string|null} chrome Chrome 路径
 */
function printEnvironment(mmdc, chrome) {
  log(`Node.js        : ${process.version}`);
  log(`mermaid-cli    : ${mmdc.label}`);
  log(`Chrome         : ${chrome || '未探测到（将使用 Puppeteer 默认浏览器）'}`);
  log(`技能根目录      : ${SKILL_ROOT}`);
  log('如 mermaid-cli 不可用，请执行：npm i -g @mermaid-js/mermaid-cli');
}

/**
 * 脚本主入口：解析参数、探测环境、批量渲染并汇总结果。
 */
function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    logError(`参数错误：${error.message}`);
    printHelp();
    process.exit(2);
  }

  if (options.help) {
    printHelp();
    return;
  }

  const mmdc = findMmdc();
  const chrome = findChrome();
  const mmdcMajor = detectMmdcMajorVersion(mmdc);

  if (options.check) {
    printEnvironment(mmdc, chrome);
    log(`mermaid-cli 主版本: ${mmdcMajor || '未知'}`);
    return;
  }

  if (options.inputs.length === 0) {
    logError('请至少指定一个 .mmd 文件或目录。');
    printHelp();
    process.exit(2);
  }

  let files;
  try {
    files = collectMmdFiles(options.inputs, options.recursive);
  } catch (error) {
    logError(error.message);
    process.exit(2);
  }

  if (files.length === 0) {
    logError('未找到任何 .mmd 文件。');
    process.exit(1);
  }

  if (options.out) {
    mkdirSync(path.resolve(options.out), { recursive: true });
  }

  log(`mermaid-cli：${mmdc.label}`);
  log(`Chrome     ：${chrome || '默认'}`);
  log(`待渲染     ：${files.length} 个文件`);

  const { configPath, cleanup } = createPuppeteerConfig(chrome);
  let success = 0;
  const failures = [];

  try {
    files.forEach((input, index) => {
      const output = options.out
        ? path.join(path.resolve(options.out), `${path.basename(input, path.extname(input))}.png`)
        : input.replace(/\.mmd$/i, '.png');

      log(`[${index + 1}/${files.length}] ${input} -> ${output}`);
      const result = renderOne(mmdc, input, output, options, configPath, mmdcMajor);
      if (result.ok) {
        success += 1;
        log('  成功');
      } else {
        failures.push({ input, error: result.error });
        logError(`  失败：${result.error}`);
      }
    });
  } finally {
    cleanup();
  }

  log(`\n渲染完成：成功 ${success}，失败 ${failures.length}`);
  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
