# Mermaid 架构与设计图生成器

一个用于把文字描述、代码结构或系统方案转换成规范 Mermaid 图的技能包。内置 27 类常用架构、设计与计划图模板与跨平台渲染脚本，一次产出可维护的 `.mmd` 源文件和高清 `.png` 图片。

## 特性

- **覆盖常见设计图**：系统架构图、物理结构图、逻辑结构图、组件图、C4 上下文/容器/动态/部署图、类图、对象图、包图、用例图、状态图、时序图、活动图、泳道图、数据流图、流程图、ER 图、组成结构图、需求图。
- **覆盖计划与沟通图**：甘特图、思维导图、用户旅程图、看板、时间线、Git 图。
- **图类型按语义选择**：根据要表达的重点推荐合适的 Mermaid 类型，而不是所有需求都用流程图。
- **按需加载降耗**：`SKILL.md` 只保留路由表、流程与通用规范，各类图的详细设计规范拆分到 `references/`；一次任务只读取所需的一份规范与一个模板。
- **源图与图片同时产出**：`.mmd` 与 `.png` 同名同目录，便于版本管理与文档引用。
- **开箱即用的模板**：`templates/` 提供 27 类图的参考实现，`examples/` 提供对应渲染样例。
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
| 时序图 | 参与者、消息顺序、同步/异步、条件与循环 | `sequenceDiagram` | [sequence.mmd](templates/sequence.mmd) |
| 活动图 | 活动、判断、分叉汇合、并发与终态 | `flowchart TD` | [activity.mmd](templates/activity.mmd) |
| 泳道图 | 跨角色/系统的职责划分与流转 | `flowchart LR` + 纵向泳道 | [swimlane.mmd](templates/swimlane.mmd) |
| C4 上下文图 | 系统边界、使用角色、外部系统 | `C4Context` | [c4-context.mmd](templates/c4-context.mmd) |
| C4 容器图 | 容器边界、技术选型、容器间依赖 | `C4Container` | [c4-container.mmd](templates/c4-container.mmd) |
| C4 动态图 | 一次业务场景中的协作顺序 | `C4Dynamic` | [c4-dynamic.mmd](templates/c4-dynamic.mmd) |
| 部署图 | 部署节点、运行容器、制品与网络关系 | `C4Deployment` | [deployment.mmd](templates/deployment.mmd) |
| 包图 / 模块依赖图 | 包边界、模块职责、依赖方向与分层约束 | `flowchart TB` | [package.mmd](templates/package.mmd) |
| 对象图 | 运行时对象实例、属性取值与链接 | `classDiagram` | [object.mmd](templates/object.mmd) |
| 需求图 | 需求、风险、验证方式、满足关系 | `requirementDiagram` | [requirement.mmd](templates/requirement.mmd) |
| 甘特图 | 任务、工期、依赖与里程碑 | `gantt` | [gantt.mmd](templates/gantt.mmd) |
| 思维导图 | 主题发散与层级归类 | `mindmap` | [mindmap.mmd](templates/mindmap.mmd) |
| 用户旅程图 | 阶段、触点、情绪评分 | `journey` | [journey.mmd](templates/journey.mmd) |
| 看板 | 工作项与流转状态 | `kanban` | [kanban.mmd](templates/kanban.mmd) |
| 时间线 | 按时间排列的关键事件 | `timeline` | [timeline.mmd](templates/timeline.mmd) |
| Git 图 | 分支、提交、合并与发布标签 | `gitGraph` | [gitgraph.mmd](templates/gitgraph.mmd) |

## 目录结构

```
mermaid-diagram-generator/
├── SKILL.md                   # 索引：路由表、工作流程、通用规范
├── README.md                  # 项目说明（本文件）
├── references/                # 按需加载的详细设计规范
│   ├── architecture.md        # 系统架构/物理/逻辑/组成/包图
│   ├── c4.md                  # 组件/C4 四层/部署
│   ├── uml.md                 # 类/对象/用例/状态/时序/活动/泳道
│   ├── data-process.md        # 数据流/流程/ER/需求
│   ├── planning.md            # 甘特/导图/旅程/看板/时间线/Git
│   └── troubleshooting.md     # 报错排查与版本降级
├── scripts/
│   ├── render.sh              # 跨平台渲染入口（bash）
│   └── render-mermaid.mjs     # 批量渲染、mmdc 与 Chrome 探测
├── templates/                 # 27 类图的 Mermaid 模板
│   ├── system-architecture.mmd
│   ├── physical-structure.mmd
│   ├── logical-structure.mmd
│   ├── component.mmd
│   ├── c4-context.mmd
│   ├── c4-container.mmd
│   ├── c4-dynamic.mmd
│   ├── deployment.mmd
│   ├── class.mmd
│   ├── object.mmd
│   ├── package.mmd
│   ├── use-case.mmd
│   ├── sequence.mmd
│   ├── activity.mmd
│   ├── swimlane.mmd
│   ├── state.mmd
│   ├── data-flow.mmd
│   ├── flowchart.mmd
│   ├── er.mmd
│   ├── composition-structure.mmd
│   ├── requirement.mmd
│   ├── gantt.mmd
│   ├── mindmap.mmd
│   ├── journey.mmd
│   ├── kanban.mmd
│   ├── timeline.mmd
│   └── gitgraph.mmd
└── examples/                  # 模板对应的 .png 渲染样例
```

## 环境要求

- Node.js 18 及以上
- mermaid-cli（`@mermaid-js/mermaid-cli`），或允许脚本通过 `npx` 临时拉取
- Chrome / Chromium（Puppeteer 缓存中的浏览器也可被自动探测）
- C4 系列、`kanban`、`timeline`、`mindmap`、`requirementDiagram` 需要 Mermaid 10+/11+，建议使用最新版 mermaid-cli

安装 mermaid-cli：

```bash
npm i -g @mermaid-js/mermaid-cli
```

## 快速开始

### 1. 通过技能使用

当需要"画架构图/流程图/ER 图"或"把方案转成图"时，按 [SKILL.md](SKILL.md) 的流程：先查路由表判定图类型，读取 `references/` 中对应的规范文档，复制最接近的模板改造，写入 `.mmd`，再渲染为 `.png`。一次任务只需读取一份规范和一个模板。

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
| 时序图 | ![时序图](examples/sequence.png) |
| 活动图 | ![活动图](examples/activity.png) |
| 泳道图 | ![泳道图](examples/swimlane.png) |
| C4 上下文图 | ![C4 上下文图](examples/c4-context.png) |
| C4 容器图 | ![C4 容器图](examples/c4-container.png) |
| C4 动态图 | ![C4 动态图](examples/c4-dynamic.png) |
| 部署图 | ![部署图](examples/deployment.png) |
| 包图 / 模块依赖图 | ![包图](examples/package.png) |
| 对象图 | ![对象图](examples/object.png) |
| 需求图 | ![需求图](examples/requirement.png) |
| 甘特图 | ![甘特图](examples/gantt.png) |
| 思维导图 | ![思维导图](examples/mindmap.png) |
| 用户旅程图 | ![用户旅程图](examples/journey.png) |
| 看板 | ![看板](examples/kanban.png) |
| 时间线 | ![时间线](examples/timeline.png) |
| Git 图 | ![Git 图](examples/gitgraph.png) |

## 编写约定

- 中文标签必须加双引号：`A["订单服务"]`；含 `()[]{}<>|` 等字符时同样需要引号。
- 换行使用 `<br/>`，不要使用 `\n`。
- 节点 ID 使用英文，显示名放在标签中；避免 `end`、`graph`、`subgraph` 等保留字。
- 注释使用 `%%` 单独成行，写明图的用途、版本与假设。
- 分层架构用 `TB`，数据流/时序感强的图用 `LR`；单张图方向保持一致。
- 单图节点建议不超过 30 个，超出时按业务域拆图。
- `C4Component`、`architecture-beta`、`block-beta` 需要 Mermaid 11+，版本不确定时优先使用 `flowchart`。
- 需求图中 `id` 使用 `R001` 这类字母数字形式，中文 `text` 必须加双引号，否则会触发词法错误。
- 思维导图使用 2 空格递增缩进，禁止混用 Tab；甘特图必须声明与实际日期一致的 `dateFormat`。

## 常见问题

| 现象 | 原因 | 处理 |
|---|---|---|
| `Parse error ... Expecting ...` | 标签含特殊字符未加引号、括号不配对、使用了保留字 ID | 给标签加引号；节点 ID 改英文；检查 `subgraph` 是否闭合 |
| 中文显示为方框 | 系统缺少 CJK 字体 | 安装 `fonts-noto-cjk`，或用 `--css` 指定可用中文字体 |
| `Failed to launch the browser process` | 容器内 Chrome 沙箱受限 | 脚本已附加 `--no-sandbox`；仍失败时检查 Chrome 路径 |
| 图片空白或被裁剪 | 画布太小或图过大 | 提高 `--width`、减少单图节点数、拆图 |
| `mmdc: command not found` | 未安装 mermaid-cli | `npm i -g @mermaid-js/mermaid-cli` 或使用 `npx` |
| 连线穿越节点 | 布局方向或节点过多 | 调整 `direction`、拆 `subgraph`、减少跨组连线 |

更完整的报错定位、Mermaid 版本要求与低版本降级方案见 [references/troubleshooting.md](references/troubleshooting.md)。

## 交付检查清单

- [ ] 图类型与语义匹配，没有把所有需求都画成流程图。
- [ ] `.mmd` 与 `.png` 同名同目录，PNG 非空且可正常打开。
- [ ] 语法无解析错误，中文正常显示，文字未被裁剪。
- [ ] 分层/分区清晰，主要依赖方向正确，没有多余全连接。
- [ ] 节点命名统一，术语与用户材料一致。
- [ ] 单图节点数量可控，复杂系统已拆分为多张图。
- [ ] 回复中说明产物路径、图类型和关键假设。
