/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { CellType } from '../types';

interface CellProps {
  type: CellType;
  isInPath: boolean;
  isHead: boolean;
  isTail: boolean;
  isCollected: boolean;
  pathIndex: number;
  currentPathLength: number; 
  connections: { up: boolean; down: boolean; left: boolean; right: boolean };
  headDirection: 'up' | 'down' | 'left' | 'right';
  tailDirection: 'up' | 'down' | 'left' | 'right';
  levelStartTime: number;
  expiryMs: number;
  rockVariant?: number;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  x: number;
  y: number;
  gridWidth: number;
  gridHeight: number;
}

const Cell: React.FC<CellProps> = ({ 
  type, 
  isInPath, 
  isHead, 
  isTail, 
  isCollected, 
  currentPathLength,
  connections, 
  headDirection,
  tailDirection,
  levelStartTime, 
  expiryMs, 
  rockVariant,
  onMouseDown, 
  onMouseEnter,
  x, 
  y
}) => {
  const [isWarning, setIsWarning] = useState(false);

  const isTimeLimited = [CellType.TREAT, CellType.YARN, CellType.STAR, CellType.PLANT, CellType.BOX].includes(type);

  useEffect(() => {
    if (isCollected || !isTimeLimited || levelStartTime === 0 || expiryMs <= 0) {
      setIsWarning(false);
      return;
    }

    const updateWarning = () => {
      const elapsed = Date.now() - levelStartTime;
      const remaining = expiryMs - elapsed;
      setIsWarning(remaining <= 1500 && remaining > 0);
    };

    const interval = setInterval(updateWarning, 100);
    updateWarning();
    return () => clearInterval(interval);
  }, [isCollected, isTimeLimited, levelStartTime, expiryMs]);

  // Obstacles are primarily tile_bush.png and tile_rock_01~07.png
  const isObstacle = [CellType.ROCK, CellType.BUSH, CellType.COUCH].includes(type);

  // Select non-repeating rock variant (1 to 7) for this level
  const rockSrc = useMemo(() => {
    const rockNum = rockVariant && rockVariant >= 1 && rockVariant <= 7
      ? rockVariant
      : (((x * 5 + y * 11) % 7) + 1);
    return `/assets/tile_rock_0${rockNum}.png`;
  }, [rockVariant, x, y]);

  // Dynamic transform for the cat body based on drag direction
  const bodyTransform = useMemo(() => {
    switch (tailDirection) {
      case 'right':
        return 'rotate(90deg)';
      case 'left':
        return 'scaleX(-1) rotate(90deg)';
      case 'down':
        return 'rotate(180deg)';
      case 'up':
      default:
        return 'rotate(0deg)';
    }
  }, [tailDirection]);

  // Render obstacle (bush or rock)
  const renderObstacle = () => {
    if (type === CellType.BUSH || type === CellType.COUCH) {
      return (
        <img 
          src="/assets/tile_bush.png" 
          alt="Bush" 
          className="w-full h-full object-contain pointer-events-none select-none" 
        />
      );
    }
    return (
      <img 
        src={rockSrc} 
        alt="Rock" 
        className="w-full h-full object-contain pointer-events-none select-none" 
      />
    );
  };

  // Render collectibles (fish, star, plant, box)
  const renderCollectibleOrGoal = () => {
    if (type === CellType.SAUCER) {
      return null;
    }

    if (isCollected || isInPath) return null;

    let elementSrc = '';
    let elementAlt = '';
    let elementSizeClass = '';
    let elementAnimClass = '';

    // Fish (Treat) -> +5s time boost
    if (type === CellType.TREAT) {
      elementSrc = '/assets/award_fish.png';
      elementAlt = 'Fish';
      elementSizeClass = 'w-[50%] h-[50%]';
      elementAnimClass = isWarning ? 'animate-award-warning' : 'animate-award-bob';
    } else if (type === CellType.YARN || type === CellType.STAR) {
      // Star (Yarn) -> +50 score
      elementSrc = '/assets/award_star.png';
      elementAlt = 'Star';
      elementSizeClass = 'w-[42%] h-[42%]';
      elementAnimClass = isWarning ? 'animate-award-warning' : 'animate-award-twinkle';
    } else if (type === CellType.PLANT) {
      // Plant bonus item -> +100 score
      elementSrc = '/assets/award_plant.png';
      elementAlt = 'Plant Bonus';
      elementSizeClass = 'w-[44%] h-[44%]';
      elementAnimClass = isWarning ? 'animate-award-warning' : 'animate-award-sway';
    } else if (type === CellType.BOX) {
      // Box mystery bonus item -> +150 score
      elementSrc = '/assets/award_box.png';
      elementAlt = 'Box Bonus';
      elementSizeClass = 'w-[46%] h-[46%]';
      elementAnimClass = isWarning ? 'animate-award-warning' : 'animate-award-jiggle';
    } else {
      return null;
    }

    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-20 select-none">
        {/* Static Background Layer: completely still, background does not move */}
        <img
          src="/assets/award_bg.png"
          alt="Award BG"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-[4px]"
        />

        {/* Dynamic Foreground Element Layer: only the element animates */}
        <div className={`relative z-10 w-full h-full flex items-center justify-center pointer-events-none transition-transform ${elementAnimClass}`}>
          <img
            src={elementSrc}
            alt={elementAlt}
            className={`${elementSizeClass} object-contain filter drop-shadow-sm pointer-events-none`}
          />
        </div>
      </div>
    );
  };

  // Vector stretch block with fill: #FDF9EE and stroke: #352F2D
  // Width calibrated to 36% (x: 32..68), matching cat neck width so head corners never peek out.
  const renderCatStretch = () => {
    const { up, down, left, right } = connections;

    // 1. HEAD CELL (Single-ended entry under the cat head):
    // Smoothly terminated with a rounded cap at the center so no square corners can leak out!
    if (isHead && !isTail) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          {up && (
            <g>
              <path d="M 32 -25 L 32 45 A 18 18 0 0 0 68 45 L 68 -25 Z" fill="#FDF9EE" />
              <line x1="32" y1="-25" x2="32" y2="45" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="68" y1="-25" x2="68" y2="45" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}
          {down && (
            <g>
              <path d="M 68 125 L 68 55 A 18 18 0 0 0 32 55 L 32 125 Z" fill="#FDF9EE" />
              <line x1="32" y1="55" x2="32" y2="125" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="68" y1="55" x2="68" y2="125" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}
          {left && (
            <g>
              <path d="M -25 32 L 45 32 A 18 18 0 0 1 45 68 L -25 68 Z" fill="#FDF9EE" />
              <line x1="-25" y1="32" x2="45" y2="32" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="-25" y1="68" x2="45" y2="68" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}
          {right && (
            <g>
              <path d="M 125 68 L 55 68 A 18 18 0 0 1 55 32 L 125 32 Z" fill="#FDF9EE" />
              <line x1="55" y1="32" x2="125" y2="32" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="55" y1="68" x2="125" y2="68" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}
        </svg>
      );
    }

    // 2. TAIL CELL (Body cell where stretch originates from underneath the body center):
    // Straight tubes seamlessly extending from underneath the dynamically oriented body into the exit direction
    if (isTail && !isHead) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          {up && (
            <g>
              <rect x="32" y="-25" width="36" height="100" fill="#FDF9EE" />
              <line x1="32" y1="-25" x2="32" y2="75" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="68" y1="-25" x2="68" y2="75" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}
          {down && (
            <g>
              <rect x="32" y="25" width="36" height="100" fill="#FDF9EE" />
              <line x1="32" y1="25" x2="32" y2="125" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="68" y1="25" x2="68" y2="125" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}
          {left && (
            <g>
              <rect x="-25" y="32" width="100" height="36" fill="#FDF9EE" />
              <line x1="-25" y1="32" x2="75" y2="32" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="-25" y1="68" x2="75" y2="68" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}
          {right && (
            <g>
              <rect x="25" y="32" width="100" height="36" fill="#FDF9EE" />
              <line x1="25" y1="32" x2="125" y2="32" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="25" y1="68" x2="125" y2="68" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}
        </svg>
      );
    }

    // 3. INTERMEDIATE CELLS:
    // Corner: Down to Right
    if (down && right && !up && !left) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          <path d="M 32 125 L 32 50 Q 32 32 50 32 L 125 32 L 125 68 L 68 68 L 68 125 Z" fill="#FDF9EE" />
          <path d="M 32 125 L 32 50 Q 32 32 50 32 L 125 32" fill="none" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 68 125 L 68 68 L 125 68" fill="none" stroke="#352F2D" strokeWidth="4.5" strokeLinejoin="miter" strokeLinecap="round" />
        </svg>
      );
    }

    // Corner: Down to Left
    if (down && left && !up && !right) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          <path d="M 68 125 L 68 50 Q 68 32 50 32 L -25 32 L -25 68 L 32 68 L 32 125 Z" fill="#FDF9EE" />
          <path d="M 68 125 L 68 50 Q 68 32 50 32 L -25 32" fill="none" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 32 125 L 32 68 L -25 68" fill="none" stroke="#352F2D" strokeWidth="4.5" strokeLinejoin="miter" strokeLinecap="round" />
        </svg>
      );
    }

    // Corner: Up to Right
    if (up && right && !down && !left) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          <path d="M 32 -25 L 32 50 Q 32 68 50 68 L 125 68 L 125 32 L 68 32 L 68 -25 Z" fill="#FDF9EE" />
          <path d="M 32 -25 L 32 50 Q 32 68 50 68 L 125 68" fill="none" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 68 -25 L 68 32 L 125 32" fill="none" stroke="#352F2D" strokeWidth="4.5" strokeLinejoin="miter" strokeLinecap="round" />
        </svg>
      );
    }

    // Corner: Up to Left
    if (up && left && !down && !right) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          <path d="M 68 -25 L 68 50 Q 68 68 50 68 L -25 68 L -25 32 L 32 32 L 32 -25 Z" fill="#FDF9EE" />
          <path d="M 68 -25 L 68 50 Q 68 68 50 68 L -25 68" fill="none" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 32 -25 L 32 32 L -25 32" fill="none" stroke="#352F2D" strokeWidth="4.5" strokeLinejoin="miter" strokeLinecap="round" />
        </svg>
      );
    }

    // Straight Horizontal
    if (left && right && !up && !down) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          <rect x="-25" y="32" width="150" height="36" fill="#FDF9EE" />
          <line x1="-25" y1="32" x2="125" y2="32" stroke="#352F2D" strokeWidth="4.5" />
          <line x1="-25" y1="68" x2="125" y2="68" stroke="#352F2D" strokeWidth="4.5" />
        </svg>
      );
    }

    // Straight Vertical
    if (up && down && !left && !right) {
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          <rect x="32" y="-25" width="36" height="150" fill="#FDF9EE" />
          <line x1="32" y1="-25" x2="32" y2="125" stroke="#352F2D" strokeWidth="4.5" />
          <line x1="68" y1="-25" x2="68" y2="125" stroke="#352F2D" strokeWidth="4.5" />
        </svg>
      );
    }

    // General fallback for multiple branches
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
        <rect x="32" y="32" width="36" height="36" fill="#FDF9EE" />

        {up && (
          <g>
            <rect x="32" y="-25" width="36" height="57" fill="#FDF9EE" />
            <line x1="32" y1="-25" x2="32" y2="32" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="68" y1="-25" x2="68" y2="32" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}

        {down && (
          <g>
            <rect x="32" y="32" width="36" height="93" fill="#FDF9EE" />
            <line x1="32" y1="68" x2="32" y2="125" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="68" y1="68" x2="68" y2="125" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}

        {left && (
          <g>
            <rect x="-25" y="32" width="57" height="36" fill="#FDF9EE" />
            <line x1="-25" y1="32" x2="32" y2="32" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="-25" y1="68" x2="32" y2="68" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}

        {right && (
          <g>
            <rect x="32" y="32" width="93" height="36" fill="#FDF9EE" />
            <line x1="68" y1="32" x2="125" y2="32" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="68" y1="68" x2="125" y2="68" stroke="#352F2D" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    );
  };

  if (isObstacle) {
    return (
      <div 
        className="relative w-full h-full rounded-[4px] overflow-hidden shadow-xs select-none"
        data-cell-type="obstacle"
      >
        {renderObstacle()}
      </div>
    );
  }

  if (type === CellType.WATER) {
    return (
      <div className="relative w-full h-full rounded-[4px] overflow-hidden bg-[#7AC8F0] border-2 border-[#52ADE0] flex items-center justify-center select-none">
        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4 opacity-80" fill="none">
          <path d="M5 20C10 16 15 24 20 20C25 16 30 24 35 20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 26C12 23 16 29 20 26C24 23 28 29 32 26" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
    );
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className="relative w-full h-full flex items-center justify-center rounded-[4px] cursor-pointer select-none overflow-visible"
    >
      {/* Tile Background Image: 
          - For goal/saucer: ui_finish_flag.png is already a complete themed tile slice, displayed directly at 100%
          - Otherwise: tile_cat_bg.png if visited, tile_empty.png if unvisited
      */}
      {type === CellType.SAUCER ? (
        <img
          src="/assets/ui_finish_flag.png"
          alt="Goal Tile"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-[4px] z-10"
        />
      ) : (
        <img
          src={isInPath ? "/assets/tile_cat_bg.png" : "/assets/tile_empty.png"}
          alt="Tile"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none rounded-[4px]"
        />
      )}

      {/* Collectible items (fish, star, plant, box) */}
      {renderCollectibleOrGoal()}

      {/* Stretched Cat path connectors & head/body */}
      {isInPath && (
        <div className="cat-stretch-layer absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
          {/* STRETCH CONNECTIONS: Vector colored blocks with fill #FDF9EE and border #352F2D (Layer z-10) */}
          {currentPathLength > 1 && renderCatStretch()}

          {/* INITIAL STATE: (path.length === 1) Complete Seated Cat (Head + Body overlaid on start cell) */}
          {isHead && isTail && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-0.5">
              <div className="relative w-[96%] h-[96%] flex items-center justify-center">
                {/* Body seated at bottom */}
                <img 
                  src="/assets/ui_cat_body.png" 
                  alt="Cat Body" 
                  className="absolute inset-0 w-full h-full object-contain filter drop-shadow-xs" 
                />
                {/* Head layered on top */}
                <img 
                  src="/assets/ui_cat_head.png" 
                  alt="Cat Head" 
                  className="absolute inset-0 w-full h-full object-contain filter drop-shadow-sm transform hover:scale-105 transition-transform" 
                />
              </div>
            </div>
          )}

          {/* STRETCHED STATE - TAIL (BODY): Higher layer z-25, strictly ABOVE the stretch layer (z-10) */}
          {isTail && !isHead && (
            <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none p-0.5">
              <div 
                className="relative w-[96%] h-[96%] flex items-center justify-center transition-transform duration-200 ease-out filter drop-shadow-sm"
                style={{ 
                  transform: bodyTransform,
                  transformOrigin: '50% 50%'
                }}
              >
                <img 
                  src="/assets/ui_cat_body.png" 
                  alt="Cat Body" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
          )}

          {/* STRETCHED STATE - HEAD: Highest layer z-30, strictly ABOVE the stretch layer (z-10) */}
          {isHead && !isTail && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-0.5">
              <div 
                className="relative w-[96%] h-[96%] flex items-center justify-center transition-transform duration-150 ease-out filter drop-shadow-md"
                style={{
                  transform: headDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
                }}
              >
                <img 
                  src="/assets/ui_cat_head.png" 
                  alt="Cat Head" 
                  className="w-full h-full object-contain select-none" 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cell;
