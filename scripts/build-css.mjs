/**
 * 单独产出一份静态 CSS 文件。
 *
 * 为什么不让 Vite 自己出：Vite 的 css-post 只在 output.format 是 es / cjs 时才把 CSS
 * 落成独立文件（见 vite/dist/node 里 `if (opts.format === "es" || opts.format === "cjs")`），
 * 而小工具容器禁止 type="module"，我们只能用 iife。走 iife 时 Vite 会把 CSS 塞进 JS、
 * 运行时用 document.createElement('style') 注入 —— 能跑，但首帧要等整个 290KB 脚本执行完
 * 才有样式，而且产物里没有 CSS 文件可供审计。
 * 所以这里用同一套 PostCSS 配置（tailwindcss + autoprefixer）直接编译 index.css。
 *
 * 也刻意不做压缩：esbuild 的 CSS 压缩会合并同一属性上的重复声明，
 * 而 index.css 里的兼容层正是靠 "height: 100vh; height: 100dvh" 这类旧值在前、
 * 新值在后的写法做降级的，压缩掉就会丢兼容性。
 *
 * 只摘注释、不压缩：源码里的中文注释是给维护者看的，不该随包发给用户
 * （里面有构建思路、被移除的外链域名等），实测占产物 20%。
 * 走 postcss 的 walkComments 而不是正则 —— 正则分不清 "/*" 出现在声明值字符串里的情况。
 * 保留 /*! 开头的注释：那是 Tailwind 的 MIT 许可声明，属于必须随产物分发的署名。
 */
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export async function buildCss(root, outFile) {
  const from = path.join(root, 'index.css');
  const result = await postcss([
    tailwindcss(path.join(root, 'tailwind.config.js')),
    autoprefixer(),
  ]).process(fs.readFileSync(from, 'utf8'), { from, to: outFile });

  for (const warning of result.warnings()) {
    console.warn(`[build-css] ${warning.toString()}`);
  }

  // 摘掉解释性注释，保留 /*! 许可声明
  result.root.walkComments((comment) => {
    if (!comment.text.startsWith('!')) comment.remove();
  });
  // 注释摘掉后会留下成片空行，收一下
  const css = result.root.toString().replace(/\n{2,}/g, '\n');

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, css);
  return css.length;
}
