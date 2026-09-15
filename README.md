# Stretchy Cat

这是一个基于 React、TypeScript 和 Vite 的网页小游戏。玩家拖动小猫经过棋盘上的每个格子，收集道具并在倒计时结束前到达终点。

## 本地运行

需要 Node.js 18 或更高版本。

```bash
npm install
npm run dev
```

浏览器打开终端输出的本地地址，通常是 `http://localhost:3000`。

## 构建网页文件

```bash
npm run build
npm run preview
```

`npm run build` 会生成 `dist/` 目录。部署时上传 `dist/` 的全部内容即可。

## 发布到静态托管

可以直接使用 Vercel、Netlify、Cloudflare Pages 或 GitHub Pages：

- 构建命令：`npm run build`
- 发布目录：`dist`
- Node.js：18 或更高版本

这是纯前端游戏，不需要服务器接口或数据库。音频资源沿用 AI Studio 的公共静态资源地址，因此部署后的页面需要能够访问外部 HTTPS 资源。
