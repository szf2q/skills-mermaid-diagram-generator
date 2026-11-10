# Mermaid 架构与设计图生成器

一个用于把文字描述、代码结构或系统方案转换成规范 Mermaid 图的技能包。内置 11 类常用架构/设计图模板与跨平台渲染脚本，一次产出可维护的 `.mmd` 源文件和高清 `.png` 图片。

## 特性

- **覆盖常见设计图**：系统架构图、物理结构图、逻辑结构图、组件图、类图、用例图、状态图、数据流图、流程图、ER 图、组成结构图。
- **图类型按语义选择**：根据要表达的重点推荐合适的 Mermaid 类型，而不是所有需求都用流程图。
- **源图与图片同时产出**：`.mmd` 与 `.png` 同名同目录，便于版本管理与文档引用。
- **开箱即用的模板**：`templates/` 提供 11 类图的参考实现，`examples/` 提供对应渲染样例。
- **跨平台批量渲染**：自动探测 `mmdc` 与 Chrome/Chromium，支持容器内无沙箱运行、批量目录渲染、主题与缩放配置。
- **版本自适应**：兼容 mermaid-cli 12+ 的 `--size` 参数与旧版本的 `-w/--width` 参数。

## 支持的图类型

| 图类型 | 语义重点 | Mermaid 类型 | 模板 |
|---|---|---|---|
| 系统架构图 | 分层、模块边界、中间件、调用与数据流向 | `flowchart TB` + `subgraph` | [system-architecture.mmd](templates/system-architecture.mmd) |
| 物理结构图 | 网络区域、服务器、规格、IP、部署关系 | `flowchart TB` + 区域 `subgraph` | [physical-structure.mmd](templates/physical-structure.mmd) |
| 逻辑结构图 | 分层职责与依赖，不含物理信息 | `flowchart TB` 分层 `subgraph` | [logical-structure.mmd](templates/logical-structure.mmd) |
| 组件图 | 组件、接口、容器边界与依赖 | `C4Component` 或 `flowchart` | [component.mmd](templates/component.mmd) |
| 类图 | 类、属性、方法、继承/组合/依赖 | `classDiagram` | [class.mmd](templates/class.mmd) |
| 用例图 | 参与者、用例、系统边界、include/extend | `flowchart LR` | [use-case.mmd](templates/use-case.mmd) |
| 状态图 | 状态、事件、守卫条件、动作、终态 | `stateDiagram-v2` | [state.mmd](templates/state.mmd) |
| 数据流图 | 外部实体、加工、数据存储、数据流 | `flowchart LR` | [data-flow.mmd](templates/data-flow.mmd) |
| 流程图 | 步骤、判断分支、循环、起止 | `flowchart TD` | [flowchart.mmd](templates/flowchart.mmd) |
| ER 图 | 实体、属性、主外键、基数关系 | `erDiagram` | [er.mmd](templates/er.mmd) |
| 组成结构图 | 系统→子系统→模块→组件的整体-部分分解 | `flowchart TD` 树形 `subgraph` | [composition-structure.mmd](templates/composition-structure.mmd) |

## 目录结构

```
mermaid-diagram-generator/
├── SKILL.md                   # 技能说明：图类型选择、设计规范、排查指南
├── README.md                  # 项目说明（本文件）
├── scripts/
│   ├── render.sh              # 跨平台渲染入口（bash）
│   └── render-mermaid.mjs     # 批量渲染、mmdc 与 Chrome 探测
├── templates/                 # 11 类图的 Mermaid 模板
│   ├── system-architecture.mmd
│   ├── physical-structure.mmd
│   ├── logical-structure.mmd
│   ├── component.mmd
│   ├── class.mmd
│   ├── use-case.mmd
│   ├── state.mmd
│   ├── data-flow.mmd
│   ├── flowchart.mmd
│   ├── er.mmd
│   └── composition-structure.mmd
└── examples/                  # 模板对应的 .png 渲染样例
```

## 环境要求

- Node.js 18 及以上
- mermaid-cli（`@mermaid-js/mermaid-cli`），或允许脚本通过 `npx` 临时拉取
- Chrome / Chromium（Puppeteer 缓存中的浏览器也可被自动探测）

安装 mermaid-cli：

```bash
npm i -g @mermaid-js/mermaid-cli
```

## 快速开始

### 1. 通过技能使用

当需要"画架构图/流程图/ER 图"或"把方案转成图"时，按 [SKILL.md](SKILL.md) 的流程：先判定图类型，复制最接近的模板改造，写入 `.mmd`，再渲染为 `.png`。

### 2. 命令行渲染

```bash
# 渲染单个文件，PNG 输出到同目录
bash scripts/render.sh diagrams/system-architecture-ecommerce.mmd

# 渲染整个目录
bash scripts/render.sh diagrams/ -o diagrams --scale 2 --width 1600

# 递归渲染并指定主题与背景
bash scripts/render.sh diagrams/ --recursive --theme dark --background transparent

# 只检查运行环境，不渲染
bash scripts/render.sh --check
```

### 渲染脚本选项

| 选项 | 说明 | 默认值 |
|---|---|---|
| `-o, --out <dir>` | PNG 输出目录 | 与输入 `.mmd` 同目录 |
| `--scale <n>` | 输出缩放倍数，2 表示高清 | `2` |
| `--width <px>` | 画布宽度，复杂图建议 1600~2400 | `1600` |
| `--theme <name>` | `default` / `dark` / `forest` / `neutral` | `default` |
| `--background <color>` | 背景色，如 `white`、`transparent`、`#ffffff` | `white` |
| `--css <file>` | 自定义 CSS，用于字体与节点样式 | 无 |
| `--recursive` | 递归处理子目录 | 关闭 |
| `--check` | 只检查运行环境 | 关闭 |
| `-h, --help` | 显示帮助 | — |

脚本按以下顺序查找 mermaid-cli：环境变量 `MMDC_BIN` → 项目内 `node_modules/.bin/mmdc` → 全局 `mmdc` → `npx -y @mermaid-js/mermaid-cli`。

## 使用示例

以系统架构图为例，`.mmd` 内容见 [system-architecture.mmd](templates/system-architecture.mmd)，渲染结果如下：

![系统架构图示例](examples/system-architecture.png)

其他示例：

| 图类型 | 渲染结果 |
|---|---|
| 逻辑结构图 | ![逻辑结构图](examples/logical-structure.png) |
| 物理结构图 | ![物理结构图](examples/physical-structure.png) |
| 组件图 | ![组件图](examples/component.png) |
| 类图 | ![类图](examples/class.png) |
| 用例图 | ![用例图](examples/use-case.png) |
| 状态图 | ![状态图](examples/state.png) |
| 数据流图 | ![数据流图](examples/data-flow.png) |
| 流程图 | ![流程图](examples/flowchart.png) |
| ER 图 | ![ER 图](examples/er.png) |
| 组成结构图 | ![组成结构图](examples/composition-structure.png) |

## 编写约定

- 中文标签必须加双引号：`A["订单服务"]`；含 `()[]{}<>|` 等字符时同样需要引号。
- 换行使用 `<br/>`，不要使用 `\n`。
- 节点 ID 使用英文，显示名放在标签中；避免 `end`、`graph`、`subgraph` 等保留字。
- 注释使用 `%%` 单独成行，写明图的用途、版本与假设。
- 分层架构用 `TB`，数据流/时序感强的图用 `LR`；单张图方向保持一致。
- 单图节点建议不超过 30 个，超出时按业务域拆图。
- `C4Component`、`architecture-beta`、`block-beta` 需要 Mermaid 11+，版本不确定时优先使用 `flowchart`。

## 常见问题

| 现象 | 原因 | 处理 |
|---|---|---|
| `Parse error ... Expecting ...` | 标签含特殊字符未加引号、括号不配对、使用了保留字 ID | 给标签加引号；节点 ID 改英文；检查 `subgraph` 是否闭合 |
| 中文显示为方框 | 系统缺少 CJK 字体 | 安装 `fonts-noto-cjk`，或用 `--css` 指定可用中文字体 |
| `Failed to launch the browser process` | 容器内 Chrome 沙箱受限 | 脚本已附加 `--no-sandbox`；仍失败时检查 Chrome 路径 |
| 图片空白或被裁剪 | 画布太小或图过大 | 提高 `--width`、减少单图节点数、拆图 |
| `mmdc: command not found` | 未安装 mermaid-cli | `npm i -g @mermaid-js/mermaid-cli` 或使用 `npx` |
| 连线穿越节点 | 布局方向或节点过多 | 调整 `direction`、拆 `subgraph`、减少跨组连线 |

## 交付检查清单

- [ ] 图类型与语义匹配，没有把所有需求都画成流程图。
- [ ] `.mmd` 与 `.png` 同名同目录，PNG 非空且可正常打开。
- [ ] 语法无解析错误，中文正常显示，文字未被裁剪。
- [ ] 分层/分区清晰，主要依赖方向正确，没有多余全连接。
- [ ] 节点命名统一，术语与用户材料一致。
- [ ] 单图节点数量可控，复杂系统已拆分为多张图。
- [ ] 回复中说明产物路径、图类型和关键假设。
