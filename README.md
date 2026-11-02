# CYBER SCAN 2077

一个纯前端、纯虚构的朋友恶搞互动网站。选择班级职务后，会播放约 8 秒的 AI 身份扫描、身份锁定、10 秒虚构警报和爆炸动画，最后进入整蛊结果页。

> 所有“国防系统”“警报”“倒计时”等军事元素均为虚构娱乐动画，不对应任何真实系统、机构、地点或事件。

## 功能

- 5 个班级职务选项，自动匹配预设姓名
- 8 秒扫描流程：连接、分析、匹配、锁定、识别成功
- 黑白为主、蓝色点缀的扁平化 UI、细线雷达与克制的扫描光效
- 身份档案页与自动继续倒计时
- 10 秒虚构警报、屏幕震动、闪白、爆炸和 `BOOOOOOM!` 动画
- 最终整蛊彩蛋与“重新开始”
- 音效默认开启，可通过右上角按钮静音
- Web Audio API 实时合成音效，不依赖音频素材或付费 API
- 适配 iPhone Safari、刘海屏安全区和不同尺寸手机
- 支持键盘操作、焦点样式、屏幕阅读器标签和“减弱动态效果”系统设置
- 不连接后端，不读取真实位置，不收集或上传任何个人信息

## 文件结构

```text
.
├── index.html    # 页面结构与内联 SVG 图标
├── style.css     # iOS 玻璃拟态视觉、动画和移动端适配
├── script.js     # 页面状态机、扫描/警报流程与 Web Audio 音效
├── icon.svg      # 浏览器图标与品牌图形
└── README.md
```

页面不依赖 npm、框架、远程字体、图片 CDN 或后端服务。

## 本地预览

直接双击 `index.html` 即可运行。也可以在当前目录启动一个本地静态服务：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个公开仓库。
2. 将本目录中的 `index.html`、`style.css`、`script.js`、`icon.svg` 和 `README.md` 上传到仓库根目录。
3. 打开仓库的 **Settings → Pages**。
4. 在 **Build and deployment** 中选择 **Deploy from a branch**。
5. Branch 选择 `main`，目录选择 `/ (root)`，点击 **Save**。
6. 等待 GitHub Actions 完成，访问 `https://你的用户名.github.io/仓库名/`。

如果使用 Git 命令行：

```bash
git init
git add .
git commit -m "feat: add CYBER SCAN 2077 prank site"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

随后按上面的 GitHub Pages 设置启用部署即可。所有资源均使用相对路径，适配项目子路径部署。

## 操作流程

1. 选择一个班级职务。
2. 点击“开始扫描”。
3. 等待约 8 秒扫描完成。
4. 身份页会显示约 4 秒，也可以立即点击“进入虚构警报”。
5. 10 秒倒计时结束后触发虚构爆炸动画。
6. 点击“重新开始”回到首页。

点击右上角声音按钮可开启或关闭合成音效。首次开启音效时，浏览器会正常创建 Web Audio 上下文。

## 隐私说明

网站仅包含静态前端代码。它不会：

- 请求定位权限
- 获取摄像头或麦克风权限
- 提交表单或向服务器发送数据
- 使用数据库、Cookie 或第三方分析服务
- 加载远程 API

姓名与职务均为页面内预设的虚构玩法数据，请仅用于朋友之间的轻度恶搞。
