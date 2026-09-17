/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// 必须排在 react 之前：垫片要在 React 模块被求值前就挂好（原因见该文件顶部注释）
import "./utils/polyfills";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/**
 * Flex 容器上的 gap 要 Chrome 84+ 才生效，而小工具的内核基线是 Chrome 61。
 * 不能用 CSS.supports('gap', '1px') 或 @supports (gap: 1px) 当判据 ——
 * 那只说明浏览器认识这个属性和值，说明不了它在 flex 布局里真的生效
 * （只支持 grid gap 的内核照样能通过语法检测）。所以这里真建一个 flex 容器量一次：
 * 两个空子项 + column 方向 + row-gap 1px，撑开高度正好是 1px 才算通过。
 * 通过就给 <html> 挂 .supports-flex-gap，index.css 据此把 margin 基线换成 gap。
 */
function supportsFlexGap() {
  const flex = document.createElement('div');
  // 用 cssText 而不是逐个赋 IDL 属性：Chrome 61 不认 row-gap，
  // 直接赋 flex.style.rowGap 只会在 style 对象上挂个无效的 JS 属性，量出来必然是 false，
  // 但读代码的人会以为检测过不了是别的原因。
  flex.style.cssText = 'position:absolute;visibility:hidden;display:flex;flex-direction:column;row-gap:1px';
  flex.appendChild(document.createElement('div'));
  flex.appendChild(document.createElement('div'));
  document.body.appendChild(flex);
  const supported = flex.scrollHeight === 1;
  if (flex.parentNode) flex.parentNode.removeChild(flex);
  return supported;
}

function boot() {
  // 在 render 之前检测一次就够，不要放进 resize 或渲染循环里反复测量。
  if (supportsFlexGap()) {
    document.documentElement.classList.add('supports-flex-gap');
  }

  const container = document.getElementById("root");

  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

// 经典脚本正常会在 </body> 前执行、body 一定存在；这里仍然兜一层，
// 以免产物里的 script 标签位置被改变后检测拿到 null。
if (document.body) {
  boot();
} else {
  document.addEventListener('DOMContentLoaded', boot);
}
