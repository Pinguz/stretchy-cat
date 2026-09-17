/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from "react";

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoDialog: React.FC<InfoDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#FFF8EB] border-4 border-[#8B5E3C] shadow-[0_12px_32px_rgba(70,40,15,0.25)] rounded-[32px] p-5 sm:p-7 w-full max-w-[400px] flex flex-col items-center max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cat ears at top */}
        <div className="absolute -top-6 flex justify-between w-44 px-2 pointer-events-none">
          <div className="w-9 h-8 bg-[#8B5E3C] rounded-t-full relative flex items-center justify-center">
            <div className="w-5 h-5 bg-[#F6AFAF] rounded-t-full" />
          </div>
          <div className="w-9 h-8 bg-[#8B5E3C] rounded-t-full relative flex items-center justify-center">
            <div className="w-5 h-5 bg-[#F6AFAF] rounded-t-full" />
          </div>
        </div>

        {/* Close cross */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#EBDBC4] hover:bg-[#DFCDB4] flex items-center justify-center text-[#6B462B] transition-colors cursor-pointer"
          title="关闭"
        >
          ✕
        </button>

        {/* Mascot & Header */}
        <div className="w-14 h-14 mt-1 mb-1.5">
          <img src="./assets/ui_cat_head.png" alt="Cat Head" className="w-full h-full object-contain filter drop-shadow-sm select-none" />
        </div>
        <h3 className="text-[#59371D] text-xl font-black">伸缩猫猫大冒险</h3>
        <p className="text-xs text-[#876346] font-medium mb-3">拉长猫咪身躯，填满草地！</p>

        {/* Rule Items */}
        <div className="w-full space-y-2 text-[#5C3B21] text-sm">
          {/* Obstacles info */}
          <div className="flex items-center flow-gap-info-row bg-[#F8EFE0] p-2 rounded-xl border border-[#E8D4BB]">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white rounded-lg border border-[#DDC6A8] p-0.5">
              <img src="./assets/tile_bush.png" alt="Obstacles" className="w-full h-full object-contain" />
            </div>
            <div className="text-xs leading-snug">
              <strong className="text-[#523319] block text-xs">障碍物（灌木 / 岩石）</strong>
              小猫无法穿过灌木与岩石，必须巧妙规划绕道路线。
            </div>
          </div>

          {/* Fish */}
          <div className="flex items-center flow-gap-info-row bg-[#F8EFE0] p-2 rounded-xl border border-[#E8D4BB]">
            <div className="w-8 h-8 flex-shrink-0 relative flex items-center justify-center rounded-lg overflow-hidden border border-[#DDC6A8]">
              <img src="./assets/award_bg.png" alt="Award BG" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              <img src="./assets/award_fish.png" alt="Fish" className="w-[50%] h-[50%] object-contain relative z-10 animate-award-bob" />
            </div>
            <div className="text-xs leading-snug">
              <strong className="text-[#523319] block text-xs">小鱼补时 (+5秒)</strong>
              限时出现！在小鱼倒计时结束前吃掉可延长通关时间。
            </div>
          </div>

          {/* Star & Plant & Box */}
          <div className="flex items-center flow-gap-info-row bg-[#F8EFE0] p-2 rounded-xl border border-[#E8D4BB]">
            <div className="w-8 h-8 flex-shrink-0 relative flex items-center justify-center rounded-lg overflow-hidden border border-[#DDC6A8]">
              <img src="./assets/award_bg.png" alt="Award BG" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              <img src="./assets/award_star.png" alt="Star" className="w-[42%] h-[42%] object-contain relative z-10 animate-award-twinkle" />
            </div>
            <div className="text-xs leading-snug">
              <strong className="text-[#523319] block text-xs">星星道具 (+50分)</strong>
              限时出现！基础积分奖励，收集可冲刺更高排位。
            </div>
          </div>

          <div className="flex items-center flow-gap-info-row bg-[#F8EFE0] p-2 rounded-xl border border-[#E8D4BB]">
            <div className="w-8 h-8 flex-shrink-0 relative flex items-center justify-center rounded-lg overflow-hidden border border-[#DDC6A8]">
              <img src="./assets/award_bg.png" alt="Award BG" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              <img src="./assets/award_plant.png" alt="Plant" className="w-[44%] h-[44%] object-contain relative z-10 animate-award-sway" />
            </div>
            <div className="text-xs leading-snug">
              <strong className="text-[#523319] block text-xs">盆栽道具 (+100分)</strong>
              限时出现！第 3 关及以上进阶积分，超时将自动消失。
            </div>
          </div>

          <div className="flex items-center flow-gap-info-row bg-[#F8EFE0] p-2 rounded-xl border border-[#E8D4BB]">
            <div className="w-8 h-8 flex-shrink-0 relative flex items-center justify-center rounded-lg overflow-hidden border border-[#DDC6A8]">
              <img src="./assets/award_bg.png" alt="Award BG" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              <img src="./assets/award_box.png" alt="Box" className="w-[46%] h-[46%] object-contain relative z-10 animate-award-jiggle" />
            </div>
            <div className="text-xs leading-snug">
              <strong className="text-[#523319] block text-xs">神秘宝箱 (+150分)</strong>
              限时出现！第 5 关及以上稀有丰厚礼盒，抓紧时间拾取！
            </div>
          </div>

          {/* Goal */}
          <div className="flex items-center flow-gap-info-row bg-[#F8EFE0] p-2 rounded-xl border border-[#E8D4BB]">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white rounded-lg border border-[#DDC6A8] p-0.5">
              <img src="./assets/ui_finish_flag.png" alt="Flag" className="w-full h-full object-contain" />
            </div>
            <div className="text-xs leading-snug">
              <strong className="text-[#523319] block text-xs">终点方格旗</strong>
              填满所有可通行的草地格子后，停在旗帜处即可通关！
            </div>
          </div>
        </div>

        {/* Start / Close button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 bg-[#F27E7E] hover:bg-[#E96F6F] active:scale-95 text-white font-bold rounded-full shadow-[0_3px_0_#C55858] transition-all cursor-pointer text-sm"
        >
          我知道啦，继续挑战！
        </button>
      </div>
    </div>
  );
};

export default InfoDialog;
