export default {
  plugins: {
    tailwindcss: {},
    // 按 package.json 的 browserslist（chrome >= 61 / ios_saf >= 18.4）补必要前缀。
    // 注意 Autoprefixer 只补前缀，不会把 flex gap、aspect-ratio、dvh 改写成等价旧布局，
    // 那部分由 index.css 里的基线层 + @supports 增强层负责。
    autoprefixer: {},
  },
};
