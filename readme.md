# 介绍

这是一个 n8n 风格的**纯静态**管理后台前端模板，适合放在 Flask 项目的子目录中作为 `static/` 资源使用。

- 技术栈：`HTML` + `TailwindCSS` + `Alpine.js` + `Material Symbols`
- 路由方式：默认 `location.hash`，可选 History API（`pushState/popstate`）；两者都会动态加载 `pages/*.html` 片段

# 快速开始

## 安装依赖

```bash
npm install
```

## 构建/监听 CSS

```bash
# 构建一次
npm run build:css

# 开发监听
npm run watch:css
```

## 本地启动静态服务器（用于开发预览）

> 不建议直接双击打开 `index.html`（`file://`）——部分功能（如 `fetch` 读取 JSON）会受浏览器安全策略影响。

Hash 路由（默认）：
```bash
python -m http.server 8000
```

访问：`http://localhost:8000/`

History 路由（需要 SPA fallback）：
```bash
npm run dev
```

## History API 路由（可选）

1. 将 `index.html` 的 `<html ... data-router="hash">` 改成 `data-router="history"`。
2. 服务端需要把“非静态资源”的请求重写到 `index.html`（否则刷新 `/workflow` 这类路径会 404）。
3. 如部署在子路径（例如 `/admin/`），可在 `<html>` 上加 `data-base="/admin/"` 显式指定基准路径（不加也会尝试自动推断）。

> 兼容说明：片段页面里旧的 `href="#workflow"` / `location.hash = ...` 仍然可用，在 History 模式下会自动转换成对应的路径路由。

# 项目结构（关键目录）

- `index.html`：入口文件（引入脚本与样式）
- `pages/*.html`：页面片段（会被动态插入到主内容区）
- `assets/js/components/*.js`：页面/组件逻辑（Alpine 组件）
- `assets/js/init-alpine.js`：注册所有 Alpine 组件
- `assets/js/components/dashboard.js`：路由与菜单（根据 hash 或 URL path 加载页面片段）
- `assets/data/*.json`：本地示例数据（开发/演示用）

# 路由与页面开发规范（非常重要）

本项目不是 SPA 框架（无 React/Vue），而是：

1. 点击左侧菜单 → 更新路由（Hash 或 History）
2. `assets/js/components/dashboard.js` 监听 `hashchange/popstate` → `fetch('pages/<route>.html')`
3. 将页面 HTML **片段**插入 `<main x-ref="mainContainer">`
4. 调用 `Alpine.initTree(...)` 让新插入的 DOM 生效

因此新增页面必须遵守：

- `pages/<route>.html` 必须是**片段**（不要写 `<!doctype> / <html> / <head> / <body> / <script>`）。
- 若页面有交互逻辑：顶层容器使用 `x-data="xxxPage"` 并在 `x-init="init()"` 初始化。
- 页面逻辑写在 `assets/js/components/xxxPage.js`，并导出 `function xxxPage() { return { ... } }`。
- 在 `assets/js/init-alpine.js` 中注册：`Alpine.data('xxxPage', xxxPage)`。
- 在 `assets/js/components/dashboard.js` 的 `menuItems` 增加菜单项：`{ label, icon, view: '<route>' }`。
- 在 `index.html` 中引入新增的页面脚本：`assets/js/components/xxxPage.js`（保持脚本组织风格一致）。

# 示例：K 线图（TradingView Lightweight Charts）

项目已集成 `lightweight-charts@5.x` 并在示例页展示：

- 页面：`pages/content-page.html`
- 逻辑：`assets/js/components/contentPage.js`
- 示例数据：`assets/data/sample-kline.json`（bars: `[date, open, high, low, close, volume]`）

说明：

- 该库 v5 使用 `chart.addSeries(...)` API（不同于旧版 `addCandlestickSeries`）。
- 示例关闭了左下角的归属 logo（`layout.attributionLogo: false`），同时在面板右上角保留了跳转 `tradingview.com` 的链接以满足归属/链接要求。
- 时间轴刻度/十字线时间格式为 `MM/dd`。

# 给大模型的提示词（让它更稳定地使用本模板）

> 目标：让大模型“按项目规则改代码”，避免随意引入新框架或把页面写成完整 HTML 文档。

## 主提示词（直接粘贴给大模型）

你在维护一个“纯静态管理后台模板”，技术栈固定为：`HTML + TailwindCSS + Alpine.js + material-symbols`（不要引入 React/Vue/构建工具/新框架）。

- 路由方式：默认 Hash 路由，可切换 History 路由（`index.html` 的 `<html data-router="history">`）；`assets/js/components/dashboard.js` 会监听 `hashchange/popstate` 并 `fetch('pages/<route>.html')` 把 HTML 片段插入 `<main x-ref="mainContainer">`，然后调用 `Alpine.initTree(...)`。
- 每个 `pages/*.html` 必须是“片段”（不要包含 `<!doctype> / <html> / <head> / <body> / <script>`），如需逻辑在顶层容器使用 `x-data="xxxPage"` + `x-init="init()"`。
- 交互逻辑写在 `assets/js/components/<xxxPage>.js`（`function xxxPage() { return { ... } }`），并在 `assets/js/init-alpine.js` 注册：`Alpine.data('xxxPage', xxxPage)`。
- 新增页面必须更新菜单：`assets/js/components/dashboard.js` 的 `menuItems`（`view: 'xxx'`），并确保存在 `pages/xxx.html`。
- JS 依赖统一在 `index.html` 引入（保持与现有顺序一致）；不要在页面片段里单独引脚本。
- 样式规则：复用现有 Tailwind 卡片/面板结构（`border-gray-200`、`rounded`、`shadow-sm`、标题条 `h-12 px-4 border-b bg-gray-50` 等），保持响应式栅格。
- 输出要求：只做最小必要改动；不要重排无关代码；所有改动必须指明文件路径；信息不足先问 1~3 个澄清问题再改。

## 任务提示词模板（每次执行时填空）

- 目标：在该模板项目中实现【功能/页面】。
- 路由：`【route】`（对应 `pages/【route】.html`；Hash 模式为 `#【route】`，History 模式为 `/【route】`）。
- 页面类型：纯静态 / Alpine 交互（选择其一）。
- UI 约束：参考 `pages/content-page.html` 的面板风格。
- 数据来源：`assets/data/xxx.json`（mock）或 `assets/js/store/*`（如需新增请遵循现有模式）。
- 交付清单：
  - 新增/修改 `pages/...`
  - 新增/修改 `assets/js/components/...`
  - 更新 `assets/js/init-alpine.js` 注册
  - 更新 `assets/js/components/dashboard.js` 菜单/路由
  - 如需：更新 `index.html` 脚本引入
