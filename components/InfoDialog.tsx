/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from "react";

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 玩法说明列表。
 *
 * 图标一律直接显示切图：不套背景卡片、不加动画。棋盘上那些道具的
 * animate-award-* 动画（定义在 index.css，Cell.tsx 在用）这里刻意不复用 ——
 * 说明页是静态阅读场景，六个图标一起动只会让人分心。
 *
 * `desc` 请控制在一行以内（12px 字号下约 13 个汉字）：整个弹窗要在手机上一屏
 * 放得下、不出现滚动条，条目数又多，行数一涨就会溢出。宽屏（≥640px）下弹窗
 * 宽度封顶 400px，文字区会比窄屏更宽，所以按最窄的情况（375px）取值即可。
 */
const RULES: { name: string; desc: string; icon: string }[] = [
  { name: "障碍物", desc: "无法穿过，需绕道规划", icon: "./assets/tile_bush.png" },
  { name: "小鱼", desc: "限时出现，吃掉 +5 秒", icon: "./assets/award_fish.png" },
  { name: "星星", desc: "限时出现，+50 分", icon: "./assets/award_star.png" },
  { name: "盆栽", desc: "第 3 关起出现，+100 分", icon: "./assets/award_plant.png" },
  { name: "宝箱", desc: "第 5 关起出现，+150 分", icon: "./assets/award_box.png" },
  { name: "方格旗", desc: "填满草地后停在旗帜处通关", icon: "./assets/ui_finish_flag.png" },
];

const InfoDialog: React.FC<InfoDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FFF8EB] border-4 border-[#8B5E3C] shadow-[0_12px_32px_rgba(70,40,15,0.25)] rounded-[28px] p-4 sm:p-6 w-full max-w-[400px] flex flex-col items-center max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#EBDBC4] hover:bg-[#DFCDB4] flex items-center justify-center text-[#6B462B] transition-colors cursor-pointer"
          title="关闭"
        >
          ✕
        </button>

        {/* 顶部无装饰：原有的猫耳（还伸到弹窗框外 24px）和猫头吉祥物都已移除。 */}
        <div className="text-center mb-3 leading-tight">
          <h3 className="text-[#59371D] text-xl font-black">伸缩猫</h3>
          <p className="text-sm text-[#876346] font-medium mt-0.5">拖动猫猫 · 填满草地</p>
        </div>

        <div className="w-full space-y-1.5 text-[#5C3B21]">
          {RULES.map((rule) => (
            <div
              key={rule.name}
              className="flex items-center flow-gap-info-row bg-[#F8EFE0] px-2 py-1.5 rounded-xl border border-[#E8D4BB]"
            >
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <img src={rule.icon} alt={rule.name} className="w-full h-full object-contain" />
              </div>
              <p className="text-xs leading-snug">
                <strong className="text-[#523319]">{rule.name}</strong>
                <span className="text-[#7A5A40]"> · {rule.desc}</span>
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full py-2.5 bg-[#F27E7E] hover:bg-[#E96F6F] active:scale-95 text-white font-bold rounded-full shadow-[0_3px_0_#C55858] transition-all cursor-pointer text-sm"
        >
          我知道啦，继续挑战！
        </button>
      </div>
    </div>
  );
};

export default InfoDialog;
