/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface FooterLeftContentProps {
  levelId: number;
  totalLevels: number;
  score: number;
}

const FooterLeftContent: React.FC<FooterLeftContentProps> = ({ 
  levelId,
  totalLevels,
  score
}) => {
  return (
    <div className="relative w-[86vw] max-w-[420px] mx-auto ratio-footer-bar select-none">
      {/* Authentic bottom bar graphic with icons and coral button slot */}
      <img 
        src="./assets/ui_btm_reset.png" 
        alt="Bottom Bar" 
        className="absolute inset-0 w-full h-full object-fill pointer-events-none filter drop-shadow-md select-none" 
      />

      {/* Left: Dynamic Level text (fixed relative to paw icon at ~12.5%) */}
      <div className="absolute left-[13%] top-0 bottom-0 flex items-center">
        <span className="text-[#654327] text-[12px] sm:text-[14px] font-black whitespace-nowrap leading-none">
          Level <strong className="text-[#E0533B] font-black">{levelId}</strong>/{totalLevels}
        </span>
      </div>

      {/* Middle: Dynamic Score text (fixed relative to star icon at ~43%) */}
      <div className="absolute left-[44%] top-0 bottom-0 flex items-center">
        <span className="pl-2 text-[#523319] text-[12px] sm:text-[14px] font-black whitespace-nowrap leading-none">
          {score.toLocaleString()}
          <span className="text-[#876346] font-black ml-0.5">分</span>
        </span>
      </div>

    </div>
  );
};

export default FooterLeftContent;
