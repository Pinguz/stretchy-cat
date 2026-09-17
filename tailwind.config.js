/**
 * 原来项目靠 https://cdn.tailwindcss.com 在运行时生成样式 —— 小工具容器不允许外部脚本，
 * 而且那个运行时用了 new Function()，属于明令禁止的能力。改成构建期用 tailwindcss v3
 * 把用到的工具类编译成静态 CSS，产物里不再有外部依赖。
 */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './logic/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // 原来是 Google Fonts 的 "Google Sans"，外链字体在小工具里加载不到，
        // 改成系统字体栈：中文优先走各平台自带的黑体，英文走 Roboto / 系统 UI 字体。
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Noto Sans CJK SC"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
