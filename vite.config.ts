import fs from 'fs';
import path from 'path';
import { defineConfig, type HtmlTagDescriptor } from 'vite';
import react from '@vitejs/plugin-react';
import { buildCss } from './scripts/build-css.mjs';

const ROOT = path.resolve(__dirname);

// 开发时让 Vite 直接吃源码里的 index.css（HMR 正常）。产物里不走这条路 ——
// 见下面 minitoolBuild 的说明。
function minitoolDev() {
  return {
    name: 'minitool-dev',
    apply: 'serve' as const,
    // 返回类型必须显式标成 HtmlTagDescriptor[]：不标的话 injectTo 会被推成 string，
    // 而 Vite 要的是 'head' | 'body' | ... 的字面量联合，tsc 会报类型不兼容。
    transformIndexHtml(): HtmlTagDescriptor[] {
      return [{ tag: 'link', attrs: { rel: 'stylesheet', href: '/index.css' }, injectTo: 'head' }];
    },
  };
}

// 构建收尾：把产物 HTML 改成小工具容器认得出的样子。
// 1) Vite 给入口脚本一律打 `type="module" crossorigin`，不看 output.format。
//    容器禁止 type="module"，而 iife 产物本来就是经典脚本，所以摘掉属性、改成经典脚本。
// 2) 同时把脚本从 <head> 挪到 </body> 前：经典脚本在 head 里是阻塞解析的，
//    而且那时 document.body 还不存在。挪到 body 末尾后，body 已经就绪，首帧也更快。
// 3) CSS 用独立的 <link> 指过来，不走 Vite 的运行时注入（原因见 scripts/build-css.mjs）。
// 4) 摘掉 HTML 注释：那些是写给维护者的构建笔记（为什么移除 CDN、为什么不要
//    type="module"），会原样进 dist 随包发给用户，也不该让容器侧的静态扫描
//    在产物文本里读到 new Function( / 外链域名 这类字样。
function minitoolBuild() {
  return {
    name: 'minitool-build',
    apply: 'build' as const,
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      let scriptSrc = '';
      const stripped = html
        .replace(/<!--[\s\S]*?-->/g, '')
        // 只摘 Vite 自己的入口脚本（产物固定落在 assets/ 下）。
        // 这里不能图省事写成「任意 .js 的 script」—— HTML 里还有一个音效数据脚本
        // ./audio/sfx-data.js，那种写法会把两个都删掉、只把最后一个 src 插回去，
        // 音效数据就静默丢了（页面照常渲染，只是没声音，很难查）。
        .replace(/<script[^>]*\ssrc="([^"]*\/assets\/[^"]+\.js)"[^>]*><\/script>\s*/g, (_match, src: string) => {
          scriptSrc = src;
          return '';
        })
        .replace(/<link rel="modulepreload"[^>]*>\s*/g, '')
        .replace(/<script type="module" crossorigin /g, '<script ')
        .replace(/<script type="module" /g, '<script ')
        // 注释摘掉后 head 里会剩空行，收一下
        .replace(/^[ \t]+\n/gm, '')
        .replace(/\n{2,}/g, '\n');

      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'stylesheet', href: './assets/index.css' }, injectTo: 'head' },
      ];
      if (scriptSrc) {
        tags.push({ tag: 'script', attrs: { src: scriptSrc }, injectTo: 'body' });
      }
      return { html: stripped, tags };
    },
    async writeBundle() {
      const bytes = await buildCss(ROOT, path.join(ROOT, 'dist/assets/index.css'));
      console.log(`\n  dist/assets/index.css  ${(bytes / 1024).toFixed(2)} kB`);

      // 音效数据由 public/ 拷进来，必须在构建前就生成好（npm 的 prebuild 钩子）。
      // 它缺失时页面照常渲染、只是全程无声，属于很难查的故障，所以这里显式喊一声。
      const sfx = path.join(ROOT, 'dist/audio/sfx-data.js');
      if (fs.existsSync(sfx)) {
        console.log(`  dist/audio/sfx-data.js  ${(fs.statSync(sfx).size / 1024).toFixed(2)} kB\n`);
      } else {
        console.warn(
          `\n  ⚠ 缺少 dist/audio/sfx-data.js —— 产物会全程无声。\n` +
            `    先跑 npm run audio:build（或直接用 npm run build，它带 prebuild 钩子）。\n`
        );
      }
    },
  };
}

// 小红书小工具容器要求（见 .claude/minitool-zip-builder）：
// - 产物必须是**经典脚本**，不能出现 type="module" / import / export → rollup output.format = 'iife'
// - 语法基线 ES2017 / Chrome 61 → build.target 与 build.cssTarget 都要显式钉住
// - 资源全部本地相对引用 → base = './'，zip 解到任意路径都能加载
export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), minitoolDev(), minitoolBuild()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    target: ['es2017', 'chrome61'],
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // iife 没有模块预加载的概念，关掉免得产物里混进 modulepreload 的 polyfill
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        // 不带 hash：容器按整包交付，文件名稳定便于核对
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
