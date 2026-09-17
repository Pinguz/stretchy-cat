/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface GameOverProps {
  type: 'win' | 'lose';
  score: number;
  onAction: () => void;
  onBackHome: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ type, score, onAction, onBackHome }) => {
  const isWin = type === 'win';
  const popupBackground = isWin
    ? '/assets/ui_popup_win_bg.png'
    : '/assets/ui_popup_timeout_bg.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-[430px] -translate-y-[4vh] aspect-[814/979] overflow-hidden">
        <img
          src={popupBackground}
          alt={isWin ? '通关提示' : '时间到提示'}
          className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
        />

        <div className="absolute left-1/2 top-[calc(54%+12px)] z-10 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-[#764D2E] text-[38px] sm:text-[44px] font-black leading-none tabular-nums whitespace-nowrap">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="absolute bottom-[5%] left-[9%] right-[9%] z-10 flex items-center justify-center gap-[5%]">
          <button
            onClick={onAction}
            className="w-[48%] cursor-pointer transition-transform active:scale-95"
            title="再玩一次"
            aria-label="再玩一次"
          >
            <img
              src="/assets/ui_btn_playAgain.png"
              alt="再玩一次"
              className="h-auto w-full object-contain"
            />
          </button>
          <button
            onClick={onBackHome}
            className="w-[43%] cursor-pointer transition-transform active:scale-95"
            title="返回主页"
            aria-label="返回主页"
          >
            <img
              src="/assets/ui_btn_backHome.png"
              alt="返回主页"
              className="h-auto w-full object-contain"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
