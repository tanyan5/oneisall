# OneIsAll — Windows 系统工具集

可插件化扩展的 Windows 桌面工具箱。首个内置工具为**剪贴板历史**：记录文本、HTML、图片与文件复制记录，支持关键字检索、删除与一键写回系统剪贴板。

## 功能

- **工具集主页**：侧边栏列出工具，右侧预览说明与快捷关键字；点击「打开」进入全屏插件视图（侧边栏隐藏）
- **工具集宿主**：无边框主窗口，无标题栏最小化/最大化/关闭按钮；`plugins/` 下通过 `plugin.json` 注册新工具（可选 `description`、`launchKeywords`、`icon`）
- **系统托盘**：关闭窗口后常驻托盘（O 环品牌标，与任务栏图标一致）；托盘右键仅「设置」「退出」；双击托盘 → 主页
- **闪开**：积木模块管理本机应用快捷方式（`.exe`/`.lnk`），分模块添加、一键启动；背景可在「赛博网格」与「Aurora 流光」间切换
- **快速启动浮层**：赛博风指挥台（呼吸灯边框、O 环品牌标、command 搜索框）；全局快捷键（默认 `Ctrl+Shift+Space`）唤起；高度随内容自适应；无近期时推荐内置工具并引导「固定关键字」；有近期时 10 列 dock 展示；O 环按钮 → 主页
- **可配置全局快捷键**：设置页可修改「打开剪贴板」「打开快速启动」快捷键，冲突时会提示
- **设置**：侧边栏底部「设置」或托盘「设置」进入（沉浸式全屏）
- **剪贴板**：列表显示时间、类型、详细信息；支持搜索与删除；点击行复制到系统剪贴板

## 入口说明

| 操作 | 落点 |
|------|------|
| 双击托盘、`app.activate`、Launcher O 环按钮 | 主页（侧边栏 + 预览） |
| 已配置的剪贴板快捷键 | 剪贴板工具（沉浸式） |
| 已配置的快速启动快捷键 | 快速启动浮层 |
| 托盘「设置」、侧边栏「设置」 | 设置页（沉浸式） |
| 侧边栏工具项 | 主页右侧预览（不直接打开） |
| 主页「打开」、Launcher 选择工具 | 对应工具（沉浸式） |
| 侧边栏品牌「OneIsAll」 | 主页 |

## Esc 行为（主窗口）

1. 关闭打开中的关键字下拉菜单
2. 若在全屏插件或设置页 → 返回主页
3. 若在主页 → 隐藏窗口到托盘

## 环境要求

- Windows 10+
- Node.js 18+

## 开发

```bash
npm install
npm run dev
```

## 打包

```bash
npm run build
npm run dist
```

安装包输出在 `release/` 目录。若打包时报符号链接权限错误，可在「开发者模式」下重试，或使用已生成的 `release/win-unpacked/OneIsAll.exe` 绿色版。

打包配置已设置 `signAndEditExecutable: false` 以避免本机无代码签名证书时的 winCodeSign 解压失败。

## 添加新工具（插件）

1. 在 `plugins/my-tool/` 创建 `plugin.json`：

```json
{
  "id": "my-tool",
  "name": "我的工具",
  "version": "1.0.0",
  "description": "一句话说明（显示在主页预览）",
  "icon": "icon.png",
  "launchKeywords": [
    {
      "id": "main",
      "label": "我的工具",
      "actions": [{ "id": "open", "label": "打开工具" }]
    }
  ]
}
```

在插件目录放置 `icon.png`（48×48 推荐，PNG）。内置插件、导航与托盘图标为赛博风图案（深色底、霓虹网格与符号），可用 `node scripts/gen-icons.mjs` 一并重新生成（含 `resources/icon.ico` 与 `resources/tray/`）；第三方插件可自备任意风格的 `icon.png`。未提供时使用首字母圆标占位。

主页预览区第二行显示 `launchKeywords` chip；点击可执行 action 或将关键字固定到 Launcher 搜索框（最多 8 条，存于 `settings.json`）。

2. 若需要主进程逻辑，添加 `main.ts` 并实现 `IToolPlugin`，在 `PluginHost` 中注册（或后续改为动态 `import`）。
3. 在 `src/renderer/plugins/my-tool/` 添加 React 视图，并在 `src/renderer/shell/ToolboxShell.tsx` 的 `PLUGIN_VIEWS` 中映射 `id` → 组件。

用户级插件目录（可选）：`%APPDATA%/OneIsAll/plugins/`

## 数据位置

- 正式版用户数据：`%APPDATA%/OneIsAll/`（剪贴板数据库、设置、闪开配置等）
- 开发模式用户数据：`%APPDATA%/OneIsAll-dev/`（与正式版隔离，避免本地测试数据出现在安装包运行结果中）

具体文件（均在 `%APPDATA%/OneIsAll/` 下）：

- 数据库：`data/clipboard.db`
- 设置（最近使用工具、固定搜索关键字等）：`%APPDATA%/OneIsAll/settings.json`
- 闪开（模块与应用快捷方式）：`%APPDATA%/OneIsAll/data/shankai.json`

## OpenSpec

规格与变更记录见 `openspec/`。已归档变更：`2026-06-05-init-toolbox-clipboard`、`2026-06-05-add-toolbox-home`、`2026-06-05-add-shortcut-settings`、`2026-06-04-add-launcher-overlay`、`2026-06-05-add-shankai-plugin`（见 `openspec/changes/archive/`）。

## 许可证

MIT
