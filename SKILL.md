---
name: "mermaid-diagram-generator"
description: "使用 Mermaid 绘制系统架构图、物理结构图、逻辑结构图、组件图、类图、用例图、状态图、数据流图、流程图、ER 图、组成结构图，并输出同名 .mmd 与 .png 文件。当用户要求画架构图、设计图、流程图、ER 图，或把文字方案/代码结构转成 Mermaid 图时调用。"
---

# Mermaid 架构与设计图生成器

把用户的文字描述、代码结构或系统方案，转换成规范、可维护的 Mermaid 图，并同时产出 `.mmd` 源文件和 `.png` 图片。

## 一、适用场景

- 用户要求绘制：系统架构图、物理结构图、逻辑结构图、组件图、类图、用例图、状态图、数据流图、流程图、ER 图、组成结构图。
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

补充规则：

- **系统架构图 vs 逻辑结构图**：前者强调系统边界、外部依赖、中间件和数据流向；后者强调内部分层与职责依赖。两者都要分层时，架构图允许出现部署/中间件节点，逻辑结构图不出现服务器、IP 等物理信息。
- **物理结构图 vs 逻辑结构图**：物理图必须体现网络区域（接入区、DMZ、应用区、数据区）、设备数量、规格或 IP；逻辑图不体现。
- **组件图**：优先使用 `C4Component` 表达组件、容器边界与依赖；若执行环境 Mermaid 版本低于 11 或渲染失败，退回 `flowchart LR` + 子图 + 带接口标签的箭头。
- **用例图**：Mermaid 无原生 UML 用例图，用 `flowchart LR` 表达；参与者用 stadium 形状 `(["参与者"])`，用例用椭圆 `(["用例"])`，系统边界用 `subgraph`，`include`/`extend` 用虚线箭头 `-.->|include|`。
- **数据流图**：只表达数据流动，不表达控制流；加工用圆形 `((...))`，外部实体用矩形 `[...]`，数据存储用圆柱 `[(...)]`，每条数据流必须有名词性标签。
- **组成结构图**：用树形分解表达整体-部分；若要严格表达 UML 组合关系（生命周期绑定），改用 `classDiagram` 的 `*--`。

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

## 六、通用语法与排版规范

- **中文标签必须加引号**：`A["订单服务"]`；标签中含 `()[]{}<>|` 等字符时必须用双引号包裹。
- **换行**用 `<br/>`，不要用 `\n`。
- **节点 ID 用英文/拼音**，避免使用 `end`、`graph`、`subgraph` 等保留字；显示名放标签里。
- **注释**用 `%%` 单独成行，写图的用途、版本、假设。
- **方向**：分层架构用 `TB`，数据流/时序感强的用 `LR`；同一张图方向保持一致。
- **配色**：优先使用内置主题；需要强调时用 `classDef` + `class`，颜色不超过 4 种，且必须有图例或说明。
- **可读性**：一张图只回答一个问题；节点文字控制在 20 字以内，超长描述放到图外说明。
- **版本兼容**：`C4Component`、`architecture-beta`、`block-beta` 需要 Mermaid 11+；不确定环境版本时优先 `flowchart`。

## 七、常见错误与排查

| 现象 | 原因 | 处理 |
|---|---|---|
| `Parse error ... Expecting ...` | 标签含特殊字符未加引号、括号不配对、使用了保留字 ID | 给标签加双引号；节点 ID 改英文；检查 `subgraph` 是否闭合 |
| 中文显示为方框 | 系统缺少 CJK 字体 | 安装 `fonts-noto-cjk`，或用 `--css` 指定可用中文字体 |
| `Failed to launch the browser process` | 容器内 Chrome 沙箱受限 | 脚本已附加 `--no-sandbox`；仍失败时检查 Chrome 路径或改用 `--puppeteer-config` |
| 图片空白/被裁剪 | 画布太小或图过大 | 提高 `--width`、降低单图节点数、拆图 |
| `mmdc: command not found` | 未安装 mermaid-cli | `npm i -g @mermaid-js/mermaid-cli` 或使用 `npx` |
| 连线穿越节点 | 布局方向或节点过多 | 调整 `direction`、拆 `subgraph`、减少跨组连线 |

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
