# 素材来源记录

| 文件 | 来源与作者 | 许可 | 本项目处理 |
| --- | --- | --- | --- |
| `assets/icons/{heart,x,arrow-left,shuffle,search,star,sliders-horizontal}.svg` | [Lucide Icons](https://lucide.dev/icons/)，Lucide Contributors | [ISC License](https://lucide.dev/license)，允许使用及修改，保留许可声明 | 从 Lucide 官方图标库下载，在页面中作为 CSS mask 使用，颜色跟随界面文字。 |
| `assets/undraw-food-truck.svg` | [unDraw Food Truck](https://undraw.co/search?search=food%20truck)，Katerina Limpitsouni | [unDraw License](https://undraw.co/license)，允许免费商业使用及修改，无强制署名 | 用于旧版 `design-preview.html`；当前交互首页没有加载此图。 |
| `assets/heytea-grape-cutout.png` | [FoodTalks 多肉葡萄实物报道](https://www.foodtalks.cn/news/3231)中的产品照片；原图来源为报道作者 | 网站展示授权未知，当前样卡已不再使用此图；公开发布前需取得许可或移除 | 早期实物图方案的抠图，现仅作历史素材留存。 |
| `assets/fonts/SmileySans-Oblique.ttf.woff2` | [得意黑 Smiley Sans](https://github.com/atelier-anchor/smiley-sans)，atelierAnchor | [SIL Open Font License 1.1](https://openfontlicense.org/) | 用于 `card-sample.html` 的主视觉中文名称。 |
| `concepts/cart-3d/three.min.js` | [Three.js](https://github.com/mrdoob/three.js)，three.js authors | MIT；许可文本见 `concepts/cart-3d/THREE-LICENSE.txt` | 当前桌面入口的 3D 餐车与吧台物件。 |
| `concepts/cart-3d/page-flip.browser.js` | [StPageFlip](https://github.com/Nodlik/StPageFlip)，Nodlik，npm `page-flip@2.0.7` | MIT；许可文本见 `concepts/cart-3d/PAGE-FLIP-LICENSE.txt` | 用于当前桌面版的 HTML 书页翻页。 |
| `concepts/cart-3d/matter.min.js` | [Matter.js](https://github.com/liabru/matter-js)，liabru，npm `matter-js@0.20.0` 官方包 | MIT；许可文本见 `concepts/cart-3d/MATTER-LICENSE.txt` | 用于当前桌面版扭蛋池碰撞与漂浮；扭蛋外观、抽取和裂壳动效由本项目编写。交互时序参考 [ChenLiheng/gashapon-machine](https://github.com/ChenLiheng/gashapon-machine)，未复制其代码或图片。 |
| `concepts/cart-3d/brand-logos/*.jpg` | 用户提供的 10 张品牌图片，位于本机 `Downloads/`；霸王茶姬为后补 `IMG_4648.jpg` | 品牌商标素材，公开使用许可未核实 | 裁剪并缩小为当前桌面版小卡右上角的本地 Logo；另收到的茉莉奶白图片未用于当前 10 品牌饮品库。 |

当前餐车、菜单、扭蛋机、排行榜和铁盒由 Three.js 几何体与 HTML/CSS 构成，便于独立点击和镜头聚焦，没有引入外部插画文件。视觉参考 [Nectar / ATNN Design](https://www.atnndesign.com/work/nectar?utm_source=Pinterest&utm_medium=organic) 用于配色、条纹和形态研究；该网站的插画、包装图及字标没有复制进本站。

Lucide 图标的许可文本见 [官方仓库](https://github.com/lucide-icons/lucide/blob/main/LICENSE)。

饮品卡样例的整体色彩与排版参考 [Refero 的 OLIPOP 风格页](https://styles.refero.design/style/c6ec55c7-0bd9-47c5-a4d2-669b7790c9cc)：奶油底 `#fdf7e7`、森林绿 `#14433d` 和葡萄口味色 `#e3d2ed`。仅借鉴风格系统，未使用 OLIPOP 标志或产品图。
