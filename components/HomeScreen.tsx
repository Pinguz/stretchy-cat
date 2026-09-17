/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface HomeScreenProps {
  onPlay: () => void;
}

// 注意：不能写 h-screen。项目用的是 Tailwind CDN，它把生成的样式注在 <link href="/index.css"> 之后，
// 且 .h-screen 排在 .h-[100dvh] 后面，等于会反过来把 h-[100dvh] 覆盖掉 → 容器变成"浏览器 UI 收起时"
// 的大视口高度，比手机实际可见区域高，底部按钮就会被切掉。只留 h-[100dvh]。
const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay }) => (
  // 复用游戏内的场景背景（.game-scene 就是 bg_mobile.png）
  <div className="game-scene relative w-full max-w-full h-[100dvh] overflow-hidden select-none font-sans flex flex-col items-center justify-between">
    {/* 招牌：顶部留出间距，别贴着屏幕边 */}
    <img
      src="/assets/ui_home_gamename.png"
      alt="伸缩猫 Stretch Cat"
      className="relative z-10 mt-[max(20px,env(safe-area-inset-top))] w-[68%] max-w-[290px] max-h-[22vh] object-contain pointer-events-none select-none drop-shadow-[0_3px_5px_rgba(72,72,45,0.25)]"
    />

    {/* 主视觉：棋盘 + 猫咪 */}
    <img
      src="/assets/ui_home_banner.png"
      alt=""
      aria-hidden="true"
      className="w-[88%] max-w-[380px] max-h-[48vh] object-contain pointer-events-none select-none drop-shadow-[0_4px_8px_rgba(72,72,45,0.2)]"
    />

    {/* 开始游戏 */}
    <button
      onClick={onPlay}
      className="mb-[max(28px,calc(env(safe-area-inset-bottom)+16px))] w-[66%] max-w-[270px] max-h-[12vh] cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      title="开始游戏"
      aria-label="开始游戏"
    >
      <img
        src="/assets/ui_home_btn_play.png"
        alt="开始游戏"
        className="h-auto w-full max-h-[12vh] object-contain"
      />
    </button>
  </div>
);

export default HomeScreen;
