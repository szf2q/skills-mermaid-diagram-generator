# 报错排查与版本降级

仅在渲染失败或需要确认 Mermaid 版本能力时读取本文档。

## 常见错误

| 现象 | 原因 | 处理 |
|---|---|---|
| `Parse error ... Expecting ...` | 标签含特殊字符未加引号、括号不配对、使用了保留字 ID | 给标签加双引号；节点 ID 改英文；检查 `subgraph` 是否闭合 |
| 中文显示为方框 | 系统缺少 CJK 字体 | 安装 `fonts-noto-cjk`，或用 `--css` 指定可用中文字体 |
| `Failed to launch the browser process` | 容器内 Chrome 沙箱受限 | 脚本已附加 `--no-sandbox`；仍失败时检查 Chrome 路径或改用 `--puppeteer-config` |
| 图片空白/被裁剪 | 画布太小或图过大 | 提高 `--width`、降低单图节点数、拆图 |
| `mmdc: command not found` | 未安装 mermaid-cli | `npm i -g @mermaid-js/mermaid-cli` 或使用 `npx` |
| 连线穿越节点 | 布局方向或节点过多 | 调整 `direction`、拆 `subgraph`、减少跨组连线 |
| `alt`/`loop`/`end` 未闭合 | 时序图代码块未配对 | 每个 `alt`/`loop`/`opt` 都要有对应的 `end` |
| `No diagram type detected`（C4） | Mermaid 版本低于 11 | 升级 mermaid-cli，或改用 `flowchart` 近似 |
| 甘特图日期错乱 | `dateFormat` 与实际日期不一致 | 统一 `dateFormat`，依赖改用 `after <id>` |
| 思维导图层级错乱 | 缩进混用 Tab 与空格 | 统一使用 2 空格递增缩进 |
| 看板渲染空白 | Mermaid 版本过低 | 升级到 10.9+，或改用表格/`flowchart` |
| 需求图词法错误 | `id` 含连字符，或中文 `text` 未加引号 | `id` 改为 `R001` 形式；`text` 用双引号包裹 |

## 版本要求与降级

| 图类型 | 最低版本建议 | 低版本降级方案 |
|---|---|---|
| `C4Context` / `C4Container` / `C4Component` | Mermaid 11+ | `flowchart` + `subgraph` + 带标签箭头 |
| `C4Dynamic` / `C4Deployment` | Mermaid 11+ | `sequenceDiagram` 或 `flowchart TB` |
| `kanban` | Mermaid 10.9+ | 表格或 `flowchart` |
| `timeline` | Mermaid 10+ | `flowchart LR` 或表格 |
| `mindmap` | Mermaid 10+ | `flowchart LR` 树形 |
| `requirementDiagram` | Mermaid 10+ | `flowchart` + 需求节点 |
| `architecture-beta` / `block-beta` | Mermaid 11+ | `flowchart` |

环境版本不确定时，先执行：

```bash
bash scripts/render.sh --check
```

该命令会打印 Node.js、mermaid-cli、Chrome 与技能根目录信息，不会触发渲染。
