---
name: "mermaid-diagram-generator"
description: "使用 Mermaid 绘制系统架构图、物理结构图、逻辑结构图、组件图、C4 上下文/容器/动态/部署图、类图、对象图、包图、用例图、状态图、时序图、活动图、泳道图、数据流图、流程图、ER 图、组成结构图、需求图，以及甘特图、思维导图、用户旅程、看板、时间线、Git 图，并输出同名 .mmd 与 .png 文件。当用户要求画架构图、设计图、流程图、时序图、ER 图、部署图，或把文字方案/代码结构转成 Mermaid 图时调用。"
---

# Mermaid 架构与设计图生成器

把用户的文字描述、代码结构或系统方案，转换成规范、可维护的 Mermaid 图，并同时产出 `.mmd` 源文件和 `.png` 图片。

## 一、适用场景

- 用户要求绘制：系统架构图、物理结构图、逻辑结构图、组件图、C4 上下文/容器/动态/部署图、类图、对象图、包图、用例图、状态图、时序图、活动图、泳道图、数据流图、流程图、ER 图、组成结构图、需求图。
- 用户要求绘制计划与沟通类图：甘特图、思维导图、用户旅程图、看板、时间线、Git 图。
- 用户给出文字方案、需求说明、代码目录或数据库设计，希望"转成图"。
- 用户已有 `.mmd` 文件，需要渲染成 `.png` 或修复渲染错误。

## 二、图类型选择

先判断用户要表达的语义，再选择 Mermaid 图类型；不要所有需求都用 `flowchart`。

| 用户说法 | 语义重点 | 推荐 Mermaid 类型 | 模板 |
|---|---|---|---|
| 系统架构图 | 分层、模块边界、关键中间件、调用/数据流向 | `flowchart TB` + `subgraph` | `templates/system-architecture.mmd` |
| 物理结构图 | 机房、网络区域、服务器、IP、规格、部署关系 | `flowchart TB` + 网络/安全区域 `subgraph` | `templates/physical-structure.mmd` |
| 逻辑结构图 | 分层职责与依赖，不含物理部署 | `flowchart TB` 分层 `subgraph` | `templates/logical-structure.mmd` |
| 组件图 | 组件、接口、容器边界、组件依赖 | `C4Component`（Mermaid 11+）或 `flowchart` | `templates/component.mmd` |
| 类图 | 类、属性、方法、继承/组合/聚合/依赖 | `classDiagram` | `templates/class.mmd` |
| 用例图 | 参与者、用例、系统边界、include/extend | `flowchart LR`（参与者 + 用例椭圆） | `templates/use-case.mmd` |
| 状态图 | 状态、事件、守卫条件、动作、终态 | `stateDiagram-v2` | `templates/state.mmd` |
| 数据流图（DFD） | 外部实体、加工、数据存储、带标签的数据流 | `flowchart LR` | `templates/data-flow.mmd` |
| 流程图 | 步骤、判断分支、循环、起止 | `flowchart TD` | `templates/flowchart.mmd` |
| ER 图 | 实体、属性、主外键、基数关系 | `erDiagram` | `templates/er.mmd` |
| 组成结构图 | 整体-部分分解：系统→子系统→模块→组件 | `flowchart TD` 树形 `subgraph` | `templates/composition-structure.mmd` |
| 时序图 | 参与者、消息顺序、同步/异步、条件与循环 | `sequenceDiagram` | `templates/sequence.mmd` |
| 活动图 | 活动、判断、分叉汇合、并发与终态 | `flowchart TD`（UML 活动图语义） | `templates/activity.mmd` |
| 泳道图 | 跨角色/系统的职责划分与流转 | `flowchart LR` + 纵向泳道 `subgraph` | `templates/swimlane.mmd` |
| C4 上下文图 | 系统边界、使用角色、外部系统 | `C4Context` | `templates/c4-context.mmd` |
| C4 容器图 | 容器边界、技术选型、容器间依赖 | `C4Container` | `templates/c4-container.mmd` |
| C4 动态图 | 一次业务场景中的容器/组件协作顺序 | `C4Dynamic` | `templates/c4-dynamic.mmd` |
| 部署图 | 部署节点、运行容器、制品与网络关系 | `C4Deployment` | `templates/deployment.mmd` |
| 包图 / 模块依赖图 | 包边界、模块职责、依赖方向与分层约束 | `flowchart TB` + `subgraph` | `templates/package.mmd` |
| 对象图 | 运行时对象实例、属性取值与链接 | `classDiagram`（实例命名） | `templates/object.mmd` |
| 需求图 | 需求、风险、验证方式、满足关系 | `requirementDiagram` | `templates/requirement.mmd` |
| 甘特图 | 任务、工期、依赖与里程碑 | `gantt` | `templates/gantt.mmd` |
| 思维导图 | 主题发散与层级归类 | `mindmap` | `templates/mindmap.mmd` |
| 用户旅程图 | 阶段、触点、情绪评分 | `journey` | `templates/journey.mmd` |
| 看板 | 工作项与流转状态 | `kanban` | `templates/kanban.mmd` |
| 时间线 | 按时间排列的关键事件 | `timeline` | `templates/timeline.mmd` |
| Git 图 | 分支、提交、合并与发布标签 | `gitGraph` | `templates/gitgraph.mmd` |

补充规则：

- **系统架构图 vs 逻辑结构图**：前者强调系统边界、外部依赖、中间件和数据流向；后者强调内部分层与职责依赖。两者都要分层时，架构图允许出现部署/中间件节点，逻辑结构图不出现服务器、IP 等物理信息。
- **物理结构图 vs 逻辑结构图**：物理图必须体现网络区域（接入区、DMZ、应用区、数据区）、设备数量、规格或 IP；逻辑图不体现。
- **组件图**：优先使用 `C4Component` 表达组件、容器边界与依赖；若执行环境 Mermaid 版本低于 11 或渲染失败，退回 `flowchart LR` + 子图 + 带接口标签的箭头。
- **用例图**：Mermaid 无原生 UML 用例图，用 `flowchart LR` 表达；参与者用 stadium 形状 `(["参与者"])`，用例用椭圆 `(["用例"])`，系统边界用 `subgraph`，`include`/`extend` 用虚线箭头 `-.->|include|`。
- **数据流图**：只表达数据流动，不表达控制流；加工用圆形 `((...))`，外部实体用矩形 `[...]`，数据存储用圆柱 `[(...)]`，每条数据流必须有名词性标签。
- **组成结构图**：用树形分解表达整体-部分；若要严格表达 UML 组合关系（生命周期绑定），改用 `classDiagram` 的 `*--`。
- **时序图 vs 活动图 vs 流程图**：时序图强调"谁在什么顺序上交互"；活动图强调业务活动、判断、分叉汇合与并发；流程图强调单主体的处理步骤。三者不要互相替代。
- **泳道图 vs 流程图**：泳道图必须按角色/系统分道，用于表达责任边界；普通流程图不要求泳道。
- **部署图 vs 物理结构图**：部署图表达软件制品与部署节点的映射；物理结构图表达网络区域、设备规格与 IP。
- **C4 四层**：Context → Container → Component → Dynamic/Deployment 逐层下钻，单张图不要跨层混画；需要表达交互顺序时，时序图与 C4 Dynamic 二选一。
- **包图 vs 逻辑结构图 vs 组成结构图**：包图强调代码依赖方向；逻辑结构图强调分层职责；组成结构图强调整体-部分分解。
- **对象图 vs 类图**：类图定义类型，对象图描述某一时刻的实例快照与属性取值。
- **辅助图**：甘特图、思维导图、用户旅程、看板、时间线、Git 图用于计划与沟通，不替代架构/设计图。
- **图版本要求**：`C4*`、`kanban`、`timeline`、`mindmap`、`requirementDiagram` 需要 Mermaid 10+/11+；环境版本不确定时，用 `flowchart` 近似或先升级。

## 三、工作流程

1. **识别图类型**：按上表把用户需求映射为 Mermaid 类型；一句话里包含多个视角时，拆成多张图，不要硬塞进一张。
2. **补齐关键信息**：明确系统名称、分层/模块、外部系统、数据存储、主要流向、参与角色。用户未提供时，使用语义清晰的占位名称（如 `订单服务`、`MySQL 主库`），并在回复中说明假设，禁止编造具体 IP、金额、SLA。
3. **复制模板改造**：从 `templates/` 选择最接近的模板，复制后替换节点与连线，保留其结构与命名风格。
4. **写入 `.mmd`**：输出到用户指定目录；未指定时使用当前工作目录下的 `diagrams/`。文件名使用 `kebab-case`，格式 `<类型>-<系统或主题>.mmd`，如 `system-architecture-ecommerce.mmd`。
5. **渲染 `.png`**：执行渲染脚本，确保与 `.mmd` 同目录同名：

   ```bash
   # 单个文件（输出到同目录）
   bash scripts/render.sh diagrams/system-architecture-ecommerce.mmd

   # 整个目录
   bash scripts/render.sh diagrams/ -o diagrams --scale 2 --width 1600

   # 深色主题、透明背景
   bash scripts/render.sh diagrams/ --theme dark --background transparent
   ```

6. **检查产物**：确认 PNG 存在且非空；必要时用图片查看能力检查布局、中文、连线是否被裁剪。
7. **交付说明**：回复中给出两张产物的路径、图类型、关键假设；不要只贴 Mermaid 源码。

## 四、渲染脚本

`scripts/render.sh` 是跨平台入口（内部调用 `scripts/render-mermaid.mjs`），支持批量渲染、自动探测 Chrome、无沙箱运行。

```bash
bash scripts/render.sh <文件或目录> [选项]
```

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

环境要求与降级策略：

1. 优先使用本机或项目内的 `mmdc`（`@mermaid-js/mermaid-cli`）。
2. 未安装时自动尝试 `npx -y @mermaid-js/mermaid-cli`；仍失败则提示安装命令：`npm i -g @mermaid-js/mermaid-cli`。
3. 自动探测 Chrome/Chromium（含 Puppeteer 缓存目录）；容器内自动附加 `--no-sandbox --disable-dev-shm-usage`。
4. 单张图渲染超时 180 秒，失败时输出 mermaid-cli 的原始错误，便于定位语法问题。

## 五、各类图的设计规范

### 1. 系统架构图

- 方向：`flowchart TB` 自上而下分层；每个层内部用 `direction LR` 横向排列。
- 分层建议：客户端层 → 接入层 → 应用服务层 → 中间件层 → 数据层；外部系统单独成组。
- 连线只画主要依赖，避免全连接；跨层调用必须体现。
- 节点名称用"名词 + 角色"，如 `API 网关`、`订单服务`；技术栈可作为第二行 `<br/>Spring Cloud`。
- 单张图节点不超过 30 个，超出时按业务域拆图。

### 2. 物理结构图

- 按网络区域分组：用户终端、接入区、DMZ、应用区、数据区、运维/备份区。
- 节点必须包含可识别的物理信息：设备角色、数量、规格、IP（若用户提供）。
- 用箭头表达网络可达性与部署关系，不表达业务调用。
- 安全设备（防火墙、WAF、堡垒机）单独标注。

### 3. 逻辑结构图

- 只表达分层与职责依赖，典型层级：表现层、业务应用层、领域服务层、数据访问层、基础设施层。
- 禁止出现 IP、机器规格、机房等物理信息。
- 同层模块之间尽量不画依赖；跨层依赖方向必须自上而下。

### 4. 组件图

- 使用 `C4Component`：`Container_Boundary` 表示容器/子系统边界，`Component`/`ComponentDb` 表示组件，`Rel` 表示依赖并注明协议或用途。
- 组件粒度：可独立部署或可替换的单元；不要把类和函数画成组件。
- 外部系统放在独立边界中，依赖箭头指向被依赖方。

### 5. 类图

- 每个类至少包含关键属性与核心方法，使用 UML 可见性：`+` public、`-` private、`#` protected。
- 关系符号：关联 `-->`、聚合 `o--`、组合 `*--`、继承 `--|>`、实现 `..|>`、依赖 `..>`。
- 多重性写在两端，如 `"1" --> "0..*"`；关系标签用动词，如 `下单`、`包含`。
- 枚举用 `<<enumeration>>` 标注；泛型用 `List~String~`。

### 6. 用例图

- 参与者放在系统边界外，用例放在 `subgraph` 内。
- 参与者与用例用实线关联；`include`、`extend` 用虚线箭头并标注关键字。
- 用例命名用"动词 + 名词"，如 `提交订单`；不要用"订单模块"这类模块名。
- 参与者过多时按角色分组（顾客、运营、管理员、外部系统）。

### 7. 状态图

- 使用 `stateDiagram-v2`；状态 ID 用英文，显示名用中文：`state "待支付" as PENDING`。
- 必须有 `[*] --> 初始状态` 和终止状态 `--> [*]`。
- 转移标签格式：`事件 [守卫条件] / 动作`，无守卫条件时只写事件。
- 复合状态用 `state 复合状态 { ... }` 表达；并发用 `--` 分隔。

### 8. 数据流图

- 四类元素：外部实体（矩形）、加工（圆形）、数据存储（圆柱）、数据流（带标签箭头）。
- 加工编号 `P1`、`P2`；数据存储编号 `D1`、`D2`，便于与需求文档对应。
- 数据流标签必须是名词或名词短语（如 `订单信息`），不能写"处理"。
- 不画控制流、不画判断分支；需要分支语义时改用流程图。

### 9. 流程图

- 起止节点用 stadium `([开始])` / `([结束])`，处理用矩形，判断用菱形 `{...}`。
- 判断分支的连线必须带 `-- 是 -->` / `-- 否 -->` 或 `-->|是|` 标签。
- 主流程从上到下，异常/补偿分支向右展开。
- 避免交叉线；必要时用 `subgraph` 分组。

### 10. ER 图

- 实体名用大写蛇形（`ORDER_ITEM`），属性行格式 `类型 名称 键 "注释"`。
- 键标记：`PK` 主键、`FK` 外键、`UK` 唯一键；联合主键写成 `PK, FK`。
- 基数符号：`||--o{` 一对零或多、`||--|{` 一对多（至少一）、`||--o|` 一对零或一。
- 关系标签用动词，如 `下单`、`包含`；只画核心业务表，避免全库铺开。

### 11. 组成结构图

- 用树形 `flowchart TD` 表达"整体—部分"：系统 → 子系统 → 模块 → 组件。
- 每个子系统用 `subgraph` 包裹其模块，子系统节点再挂到根节点。
- 同级模块保持同一粒度；不要在同层混用"子系统"和"函数"。
- 若需表达生命周期绑定或强整体-部分语义，改用 `classDiagram` 的 `*--`。

### 12. 时序图

- 参与者按"用户 → 前端 → 网关 → 服务 → 存储"顺序声明，外部角色用 `actor` 标注。
- 用 `->>` 表达同步调用、`-->>` 表达返回、`-)` 表达异步消息；关键场景开启 `autonumber`。
- 条件分支用 `alt/else/end`，循环用 `loop`，可选步骤用 `opt`，每个块必须闭合。
- `Note over` 只补充约束（幂等、超时、重试），不要写实现细节。
- 只画一个场景；多场景拆分多张图，避免单图过长。

### 13. 活动图

- `([开始])` 与 `([结束])` 必须成对出现；判断用菱形 `{...}`。
- Mermaid 无原生活动图，用 `flowchart TD` 近似；分叉/汇合用显式节点（如"分叉""汇合"）标注。
- 判断分支连线必须带 `-- 是 -->` / `-- 否 -->` 等标签。
- 一个节点只表达一个活动，不要把多个动作塞进同一节点。
- 并发分支应全部汇合后再进入后续活动，避免悬空分支。

### 14. 泳道图

- 每个角色/系统一个纵向 `subgraph`，内部 `direction TB`，外层使用 `flowchart LR`。
- 箭头只跨泳道表达流转；泳道内不要画无意义的顺序连线。
- 跨泳道回退（如补充材料）用虚线箭头并标注原因。
- 泳道数量建议不超过 6 个，过多时按主流程拆图。
- 同一泳道内节点保持同一责任粒度，避免把系统与个人混在同一泳道。

### 15. C4 上下文图

- 只画一个目标系统，使用 `System`；外部依赖使用 `System_Ext`。
- 角色使用 `Person`，不要出现数据库、中间件等内部容器。
- `Rel` 标签写"做什么 + 协议"，如 `发起支付 / HTTPS API`。
- 用于对齐系统边界与外部依赖，不展开内部实现。
- 需要下钻时分别使用 C4 容器图、组件图或动态图，不要在同一张图混层。

### 16. C4 容器图

- `System_Boundary` 内只放可独立部署/运行的容器；数据库用 `ContainerDb`，消息队列用 `ContainerQueue`。
- 每个容器注明技术选型与职责；单图容器数量建议不超过 12 个。
- 只画容器间主要依赖，避免全连接。
- 与部署图的区别：容器图表达逻辑容器及依赖，部署图表达容器落在哪些节点。
- 外部系统使用 `System_Ext` 放在边界外，依赖箭头指向被依赖方。

### 17. C4 动态图

- 用 `RelIndex(序号, 起点, 终点, "动作")` 表达一次场景的调用顺序。
- 只保留该场景涉及的容器/组件，避免把全量架构搬进来。
- 与 `sequenceDiagram` 二选一：需要参与者交互细节用时序图，需要保持 C4 容器视角时用动态图。
- 序号必须连续且与实际执行顺序一致。

### 18. 部署图

- 用嵌套 `Deployment_Node` 表达"区域 → 集群 → 节点 → 容器"的层级。
- 节点注明环境（生产/预发）、编排方式（K8s/虚拟机）与副本规模。
- `Rel` 表达网络调用与协议端口，不表达业务语义。
- 与物理结构图配合使用：部署图讲软件落地，物理图讲网络与硬件。
- `C4Deployment` 需要 Mermaid 11+，低版本环境退回 `flowchart TB` + 区域 `subgraph`。

### 19. 包图 / 模块依赖图

- 用 `subgraph` 表示包/层，节点名使用实际模块名。
- 依赖方向必须自上而下（接口层 → 应用层 → 领域层 → 基础设施层），禁止反向依赖。
- 循环依赖必须显式暴露并标注，作为重构项。
- 不要在包图中画类与方法，粒度保持在模块级。
- 需要表达代码级细节时改用类图。

### 20. 对象图

- 对象命名格式 `对象名 : 类型`，属性直接写取值（如 `status = "PAID"`）。
- 只画与当前场景相关的对象，不复制完整类结构。
- 链接标注动作或关系（`拥有`、`包含`、`支付`），多重性写在两端。
- 用于排查数据状态问题或讲解运行时快照，不替代类图。
- Mermaid 无独立对象图，使用 `classDiagram` 的实例命名表达。

### 21. 需求图

- 需求类型按语义选择：`requirement`、`functionalRequirement`、`performanceRequirement`、`interfaceRequirement`、`physicalRequirement`、`designConstraint`。
- 每条需求必须有 `id`、`text`、`risk`、`verifymethod`。
- `id` 使用字母数字下划线（如 `R001`），不要使用连字符；中文 `text` 必须用双引号包裹，否则会触发词法错误。
- 用 `satisfies`、`verifies`、`derives`、`traces` 表达追溯关系。
- 只画关键需求，完整需求清单放在需求管理工具中。
- 关系箭头方向为"设计元素 → 需求"，不要画反。

### 22. 甘特图

- 必须声明 `dateFormat`，任务日期格式与之一致。
- 用 `after <任务ID>` 表达依赖，避免手写日期造成冲突。
- 里程碑用 `:milestone, id, 日期, 0d`；排除非工作日用 `excludes weekends`。
- 只画到任务级，不要细化到个人每日工时。
- 任务按阶段 `section` 分组，任务名控制在 20 字以内。

### 23. 思维导图

- 根节点用 `root((主题))`，层级使用 2 空格递增缩进，禁止混用 Tab。
- 同级节点保持同一粒度，建议 3~4 层。
- 一个分支只表达一个维度（功能、架构、质量、演进等）。
- 用于方案发散与范围对齐，不承载具体设计细节。

### 24. 用户旅程图

- 按阶段 `section` 分组，每个触点格式为 `触点: 情绪分: 角色`。
- 情绪分取 1~5，低于 3 的触点应在评审中重点讨论。
- 角色写真实参与者（顾客、客服、系统），不要写抽象词。
- 用于识别体验短板，不表达系统内部实现。

### 25. 看板

- 列使用 `列ID[列名]`，卡片使用 `卡片ID[卡片标题]`。
- 列顺序按实际流转（需求池 → 待开发 → 开发中 → 测试中 → 已完成）。
- 卡片保持可执行粒度，避免一个卡片包含多个交付物。
- `kanban` 需要 Mermaid 10.9+，低版本环境改用表格或 `flowchart` 替代。

### 26. 时间线

- 时间粒度统一（年、季度或月），同一张图不要混用。
- 同一时间点的多个事件用续行 `:` 表达。
- 事件按时间升序排列，只保留关键节点。
- 用于演进回顾与规划沟通，不替代甘特图的任务依赖。

### 27. Git 图

- `commit` 使用语义化消息；需要发布锚点时加 `tag`。
- 分支策略与团队实际一致（Git Flow、trunk-based 等）。
- 合并必须显式写出源分支；分支名避免空格与斜杠，必要时加引号。
- 只画关键提交，不要 1:1 还原真实提交历史。

## 六、通用语法与排版规范

- **中文标签必须加引号**：`A["订单服务"]`；标签中含 `()[]{}<>|` 等字符时必须用双引号包裹。
- **换行**用 `<br/>`，不要用 `\n`。
- **节点 ID 用英文/拼音**，避免使用 `end`、`graph`、`subgraph` 等保留字；显示名放标签里。
- **注释**用 `%%` 单独成行，写图的用途、版本、假设。
- **方向**：分层架构用 `TB`，数据流/时序感强的用 `LR`；同一张图方向保持一致。
- **配色**：优先使用内置主题；需要强调时用 `classDef` + `class`，颜色不超过 4 种，且必须有图例或说明。
- **可读性**：一张图只回答一个问题；节点文字控制在 20 字以内，超长描述放到图外说明。
- **版本兼容**：`C4Component`、`architecture-beta`、`block-beta` 需要 Mermaid 11+；不确定环境版本时优先 `flowchart`。
- **新图型版本要求**：`C4Context`/`C4Container`/`C4Dynamic`/`C4Deployment`、`kanban`、`timeline`、`mindmap`、`requirementDiagram` 需要 Mermaid 10+/11+；其中 `C4Deployment`、`C4Dynamic` 建议 Mermaid 11+，版本不确定时退回 `flowchart`。

## 七、常见错误与排查

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

## 八、交付检查清单

- [ ] 图类型与用户语义匹配，没有把所有需求都画成流程图。
- [ ] `.mmd` 与 `.png` 同名同目录，PNG 非空且可正常打开。
- [ ] 语法无解析错误，中文正常显示，文字未被裁剪。
- [ ] 分层/分区清晰，主要依赖方向正确，没有多余全连接。
- [ ] 节点命名统一（同一概念只有一种叫法），术语与用户材料一致。
- [ ] 单图节点数量可控（建议 ≤ 30），复杂系统已拆分为多张图。
- [ ] 回复中说明产物路径、图类型和关键假设。

## 九、目录结构

```
mermaid-diagram-generator/
├── SKILL.md
├── scripts/
│   ├── render.sh              # 跨平台渲染入口
│   └── render-mermaid.mjs     # 批量渲染与 Chrome 探测
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
