/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface HomeScreenProps {
  onPlay: () => void;
}

// 全屏高度与上下留白都走 index.css 里的兼容类，不写 Tailwind 的任意值：
// - .screen-home  ：基线 100vh，能用 dvh 时再换成 dvh（地址栏收起后 vh 比可见区域高，会把开始按钮顶出屏幕）
// - .home-top-gap / .home-bottom-gap ：基线是固定像素，能用 max()+env() 时才叠加安全区
// （别在注释里写出这些 Tailwind 任意值的原样写法：构建期扫描器会把注释也当内容，
//   凭空生成一条产物里根本用不到、且旧内核解析不了的规则。）
// 直接拿任意值写 dvh 高度 / 带 max()+env() 的留白的话，Chrome 61 会把整条声明丢掉，
// 高度塌成 auto、留白归零。
const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay }) => (
  // 复用游戏内的场景背景（.game-scene 就是 bg_mobile.png）
  <div className="game-scene screen-home relative w-full max-w-full overflow-hidden select-none font-sans flex flex-col items-center justify-between">
    {/* 招牌：顶部留出间距，别贴着屏幕边 */}
    <img
      src="./assets/ui_home_gamename.png"
      alt="伸缩猫 Stretch Cat"
      className="home-top-gap relative z-10 w-[68%] max-w-[290px] max-h-[22vh] object-contain pointer-events-none select-none drop-shadow-[0_3px_5px_rgba(72,72,45,0.25)]"
    />

    {/* 主视觉：棋盘 + 猫咪 */}
    <img
      src="./assets/ui_home_banner.png"
      alt=""
      aria-hidden="true"
      className="w-[88%] max-w-[380px] max-h-[48vh] object-contain pointer-events-none select-none drop-shadow-[0_4px_8px_rgba(72,72,45,0.2)]"
    />

    {/* 开始游戏 */}
    <button
      onClick={onPlay}
      className="home-bottom-gap w-[66%] max-w-[270px] max-h-[12vh] cursor-pointer transition-transform hover:scale-105 active:scale-95"
      title="开始游戏"
      aria-label="开始游戏"
    >
      <img
        src="./assets/ui_home_btn_play.png"
        alt="开始游戏"
        className="h-auto w-full max-h-[12vh] object-contain"
      />
    </button>
  </div>
);

export default HomeScreen;
