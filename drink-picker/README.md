# 杯选

桌面单屏 3D 奶茶车。点击吧台物件，可聚焦打开书本菜单、扭蛋机、口味排行榜和收藏铁盒；饮品小卡支持收藏与个人备注。

线上地址：https://drink-picker-xi.vercel.app/

## 部署

当前版本通过 Vercel 手动上传静态文件发布，项目名为 `drink-picker`，未连接 Git。修改本地文件后，需要重新上传并部署，线上内容不会自动更新。上传内容应包含根目录的 `index.html`、`drinks.draft.json` 和 `concepts/cart-3d/` 中网页引用的资源；`.vercelignore` 列出不需要发布的历史样稿与文档。

## 运行

在本目录启动任意静态文件服务器，例如：

```bash
python3 -m http.server 5173
```

浏览器打开 `http://127.0.0.1:5173/`。不需要安装依赖或配置后端。直接双击 HTML 文件可能无法读取 `drinks.draft.json`。

## 数据

`drinks.draft.json` 是手工整理的 80 款演示饮品，每品牌 8 款，分为咖啡、奶茶、果茶、酸奶。名称、价格、榜单与建议均用于界面演示，不代表实时菜单或官方营养信息。

收藏和个人备注保存在当前浏览器的 LocalStorage（键 `drink-picker:v1`），不会上传。清除浏览器数据会删除这些个人记录。旧 CSS 原型还保留五星评分字段。

## 文件

- `index.html`：当前桌面网页入口，加载 `concepts/cart-3d/` 的场景和交互资源。聚焦物件、返回吧台都在当前页完成。
- `concepts/cart-3d/`：3D 页面源码与独立预览入口；菜单、铁盒、扭蛋机、排行榜共用演示饮品库和明星小卡。
- `legacy-index.html`、`styles.css`、`app.js`：旧 CSS 餐车原型，保留供回溯；`DESIGN.md` 描述该历史版本。
- 桌面版已做关键流程验证；手机端不在当前开发范围内。
- `ASSET_LICENSES.md`：素材来源与许可。
- `design-preview.html`：先前的长页面视觉稿，仅作历史参考。
