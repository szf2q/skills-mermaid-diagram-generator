---
name: "mermaid-diagram-generator"
description: "使用 Mermaid 绘制软件设计图并输出同名 .mmd 与 .png，支持架构/物理/逻辑/部署/包/C4、UML（类/对象/用例/状态/时序/活动/泳道）、数据流/流程图/ER/需求图，以及甘特/思维导图/用户旅程/看板/时间线/Git 图。当用户要求画架构图、设计图、UML 图、流程图、时序图、ER 图，或把文字方案/代码结构转成 Mermaid 图时调用。"
---

# Mermaid 架构与设计图生成器

把文字描述、代码结构或系统方案转换成规范、可维护的 Mermaid 图，并同时产出同名 `.mmd` 源文件与 `.png` 图片。

## 一、渐进式加载

本技能按需读取资料，不要一次性加载全部内容：

1. 用第二节路由表确定图类型。
2. 只读取该类型对应的 `references/` 规范文档与 `templates/` 模板。
3. 一次任务通常只需 1 份规范 + 1 个模板，禁止批量读取整个 `references/` 或 `templates/` 目录。
4. 只有渲染报错时，才读取 `references/troubleshooting.md`。

## 二、图类型路由

先判断用户要表达的语义，再选择 Mermaid 类型；不要所有需求都用 `flowchart`。

| 用户说法 | Mermaid 类型 | 模板（templates/） | 规范（references/） |
|---|---|---|---|
| 系统架构图 | `flowchart TB` + `subgraph` | `system-architecture` | `architecture.md` |
| 物理结构图 | `flowchart TB` + 区域 `subgraph` | `physical-structure` | `architecture.md` |
| 逻辑结构图 | `flowchart TB` 分层 | `logical-structure` | `architecture.md` |
| 组成结构图 | `flowchart TD` 树形 | `composition-structure` | `architecture.md` |
| 包图 / 模块依赖图 | `flowchart TB` + `subgraph` | `package` | `architecture.md` |
| 组件图 | `C4Component` 或 `flowchart` | `component` | `c4.md` |
| C4 上下文图 | `C4Context` | `c4-context` | `c4.md` |
| C4 容器图 | `C4Container` | `c4-container` | `c4.md` |
| C4 动态图 | `C4Dynamic` | `c4-dynamic` | `c4.md` |
| 部署图 | `C4Deployment` | `deployment` | `c4.md` |
| 类图 | `classDiagram` | `class` | `uml.md` |
| 对象图 | `classDiagram` 实例 | `object` | `uml.md` |
| 用例图 | `flowchart LR` | `use-case` | `uml.md` |
| 状态图 | `stateDiagram-v2` | `state` | `uml.md` |
| 时序图 | `sequenceDiagram` | `sequence` | `uml.md` |
| 活动图 | `flowchart TD` | `activity` | `uml.md` |
| 泳道图 | `flowchart LR` + 纵向泳道 | `swimlane` | `uml.md` |
| 数据流图 | `flowchart LR` | `data-flow` | `data-process.md` |
| 流程图 | `flowchart TD` | `flowchart` | `data-process.md` |
| ER 图 | `erDiagram` | `er` | `data-process.md` |
| 需求图 | `requirementDiagram` | `requirement` | `data-process.md` |
| 甘特图 | `gantt` | `gantt` | `planning.md` |
| 思维导图 | `mindmap` | `mindmap` | `planning.md` |
| 用户旅程图 | `journey` | `journey` | `planning.md` |
| 看板 | `kanban` | `kanban` | `planning.md` |
| 时间线 | `timeline` | `timeline` | `planning.md` |
| Git 图 | `gitGraph` | `gitgraph` | `planning.md` |

选型要点（详细边界见各规范文档）：

- 架构图讲系统边界、中间件与数据流；逻辑结构图只讲分层职责；物理结构图才出现网络区域、设备与 IP。
- 时序图讲交互顺序，活动图讲业务活动与并发，流程图讲单主体处理步骤，三者不要互相替代。
- C4 逐层下钻，单图不跨层混画；C4 动态图与时序图二选一。
- 类图定义类型，对象图是运行时快照；包图讲依赖方向，组成结构图讲整体-部分。
- 甘特图、思维导图、用户旅程、看板、时间线、Git 图用于计划与沟通，不替代架构/设计图。

## 三、工作流程

1. **识别图类型**：按路由表映射；一句话包含多个视角时拆成多张图。
2. **补齐关键信息**：明确系统名称、分层/模块、外部系统、数据存储、主要流向、参与角色。用户未提供时使用语义清晰的占位名称（如 `订单服务`、`MySQL 主库`），并在回复中说明假设；禁止编造具体 IP、金额、SLA。
3. **读规范 + 改模板**：读取对应 `references/` 文档，复制最接近的模板后替换节点与连线，保留其结构与命名风格。
4. **写入 `.mmd`**：输出到用户指定目录；未指定时用当前工作目录下的 `diagrams/`。文件名使用 kebab-case，格式 `<类型>-<系统或主题>.mmd`。
5. **渲染 `.png`**：执行渲染脚本，确保与 `.mmd` 同名同目录：

   ```bash
   # 单个文件（输出到同目录）
   bash scripts/render.sh diagrams/system-architecture-ecommerce.mmd

   # 整个目录
   bash scripts/render.sh diagrams/ -o diagrams --scale 2 --width 1600

   # 深色主题、透明背景
   bash scripts/render.sh diagrams/ --theme dark --background transparent
   ```

6. **检查产物**：确认 PNG 存在且非空；必要时查看布局、中文、连线是否被裁剪。
7. **交付说明**：回复中给出产物路径、图类型与关键假设；不要只贴 Mermaid 源码。

## 四、渲染脚本

`scripts/render.sh` 是跨平台入口（内部调用 `scripts/render-mermaid.mjs`），支持批量渲染、自动探测 Chrome、容器内无沙箱运行。

| 选项 | 说明 | 默认值 |
|---|---|---|
| `-o, --out <dir>` | PNG 输出目录 | 与输入文件同目录 |
| `--scale <n>` | 输出缩放倍数，2 表示高清 | `2` |
| `--width <px>` | 画布宽度，复杂图建议 1600~2400 | `1600` |
| `--theme <name>` | `default` / `dark` / `forest` / `neutral` | `default` |
| `--background <color>` | 背景色，如 `white`、`transparent`、`#ffffff` | `white` |
| `--css <file>` | 自定义 CSS，用于字体、节点样式 | 无 |
| `--recursive` | 递归处理子目录 | 关闭 |
| `--check` | 只检查运行环境，不渲染 | 关闭 |

探测顺序：`MMDC_BIN` → 项目内 `node_modules/.bin/mmdc` → 全局 `mmdc` → `npx -y @mermaid-js/mermaid-cli`。容器内自动附加 `--no-sandbox --disable-dev-shm-usage`；单图渲染超时 180 秒。

## 五、通用语法规范

- **中文标签必须加双引号**：`A["订单服务"]`；标签含 `()[]{}<>|` 等字符时同样用双引号包裹。
- **换行**用 `<br/>`，不要用 `\n`。
- **节点 ID 用英文/拼音**，避免 `end`、`graph`、`subgraph` 等保留字；显示名放标签里。
- **注释**用 `%%` 单独成行，写明图的用途、版本与假设。
- **方向**：分层架构用 `TB`，数据流/时序感强的用 `LR`；同一张图方向保持一致。
- **配色**：优先使用内置主题；需要强调时用 `classDef` + `class`，颜色不超过 4 种，并配图例或说明。
- **可读性**：一张图只回答一个问题，节点文字控制在 20 字以内，超长描述放到图外说明。
- **版本兼容**：环境版本不确定时优先 `flowchart`；C4、`kanban`、`timeline`、`mindmap`、`requirementDiagram` 的版本要求见 `references/troubleshooting.md`。

## 六、常见错误（高频）

| 现象 | 处理 |
|---|---|
| `Parse error ... Expecting ...` | 标签加双引号；节点 ID 改英文；检查 `subgraph` 是否闭合 |
| 中文显示为方框 | 安装 `fonts-noto-cjk`，或用 `--css` 指定可用中文字体 |
| Chrome 启动失败 | 脚本已附加 `--no-sandbox`；仍失败时检查 Chrome 路径 |
| 图片空白或被裁剪 | 提高 `--width`、减少单图节点数、拆图 |
| C4 报 `No diagram type detected` | Mermaid 版本低于 11，升级或改用 `flowchart` 近似 |

其余报错、版本要求与降级策略见 [references/troubleshooting.md](references/troubleshooting.md)。

## 七、交付检查清单

- [ ] 图类型与用户语义匹配，没有把所有需求都画成流程图。
- [ ] `.mmd` 与 `.png` 同名同目录，PNG 非空且可正常打开。
- [ ] 语法无解析错误，中文正常显示，文字未被裁剪。
- [ ] 分层/分区清晰，主要依赖方向正确，没有多余全连接。
- [ ] 节点命名统一，术语与用户材料一致。
- [ ] 单图节点数量可控（建议 ≤ 30），复杂系统已拆分为多张图。
- [ ] 回复中说明产物路径、图类型和关键假设。

## 八、目录结构

```
mermaid-diagram-generator/
├── SKILL.md                 # 索引：路由表、流程、通用规范
├── references/              # 按需加载的详细规范
│   ├── architecture.md      # 系统架构/物理/逻辑/组成/包图
│   ├── c4.md                # 组件/C4 四层/部署
│   ├── uml.md               # 类/对象/用例/状态/时序/活动/泳道
│   ├── data-process.md      # 数据流/流程/ER/需求
│   ├── planning.md          # 甘特/导图/旅程/看板/时间线/Git
│   └── troubleshooting.md   # 报错排查与版本降级
├── templates/               # 27 类图模板
├── examples/                # 模板对应的 .png 渲染样例
└── scripts/                 # 渲染入口与批量渲染脚本
```
