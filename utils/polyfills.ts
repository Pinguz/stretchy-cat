/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * 内核基线的运行时 API 兜底。
 *
 * 放在入口的第一个 import：ES 的 import 会被提升，如果把它写成 index.tsx 里的普通语句，
 * 它会排在所有 import 之后执行 —— 顺序就变得不可控了。
 * 严格说垫片只需要早于 React 的**首次渲染**（allSettled 是在渲染路径里调的，
 * 不在模块初始化里；实测打包后它落在产物 0.5% 处，前面已经有 react 的模块代码），
 * 但放在第一位能把这个顺序固定下来，以后加代码也不会被挤到后面。
 *
 * 为什么必须有这一层：构建目标是 es2017 + chrome61，但打包器只转译**语法**
 * （`?.`、`??`、可选 catch 绑定这类），不会给**运行时方法**加垫片 ——
 * `build.target` 里写了 chrome61 也不代表 `Object.fromEntries` 在 Chrome 61 上存在。
 * 所以凡是基线之后才有的运行时 API，要么有 `typeof` 守卫，要么在这里补。
 *
 * 现状：应用自身的代码只用 ES2017 及更早的运行时 API。
 * 下面这个垫片是给 React 19 兜的 —— 它在 View Transition 的代码路径里直接调了
 * Promise.allSettled（Chrome 76+），且**没有**做存在性判断。
 * 本项目没有使用视图过渡，那条路径目前不可达；但产物跑在没有 devtools 的容器里，
 * 一旦哪天被间接走到就是整页白屏，代价远高于这几行。
 * （React 自己给 queueMicrotask / AbortController 都带了守卫式垫片，不用我们管。）
 */

// 用别名 + 断言赋值，而不是直接写 Promise.allSettled = ...
// tsconfig 的 lib 是 ES2022，那里 allSettled 的声明签名比这个垫片严格得多，
// 直接赋值会让编辑器报类型错，而垫片本来只需要满足运行时契约。
const PromiseCtor = Promise as unknown as {
  allSettled?: (values: Iterable<unknown>) => Promise<Array<PromiseSettledResult<unknown>>>;
};

if (typeof Promise !== 'undefined' && typeof PromiseCtor.allSettled !== 'function') {
  PromiseCtor.allSettled = function (values) {
    // Array.from 而不是 Array.prototype.map.call：后者要求类数组，
    // 传 Set 之类的可迭代对象会直接抛错，而 allSettled 的入参允许任意 iterable。
    return Promise.all(
      Array.from(values).map(function (item) {
        return Promise.resolve(item).then(
          function (value) {
            return { status: 'fulfilled', value: value };
          },
          function (reason) {
            return { status: 'rejected', reason: reason };
          }
        );
      })
    ) as Promise<Array<PromiseSettledResult<unknown>>>;
  };
}

export {};
