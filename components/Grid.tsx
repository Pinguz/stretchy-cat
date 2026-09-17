/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { LevelData, Point, CellType } from '../types';
import { collectibleLifetimeMs } from '../constants';
import Cell from './Cell';

interface GridProps {
  level: LevelData;
  path: Point[];
  timeBonuses?: { id: number; x: number; y: number; text: string; color?: string; type?: 'time' | 'score' }[];
  collectedItems: string[];
  isTreatActive: boolean;
  isYarnActive: boolean;
  isPlantActive?: boolean;
  isBoxActive?: boolean;
  levelStartTime: number;
  onCellMouseDown: (p: Point) => void;
  onCellMouseEnter: (p: Point) => void;
}

const Grid: React.FC<GridProps> = ({ 
  level, path, timeBonuses = [], collectedItems, isTreatActive, isYarnActive, isPlantActive = true, isBoxActive = true, levelStartTime, onCellMouseDown, onCellMouseEnter
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const collectedSet = useMemo(() => new Set(collectedItems), [collectedItems]);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { tileSize, gap } = useMemo(() => {
    const maxDim = Math.max(level.width, level.height);
    const isSm = windowSize.width >= 640;
    
    // 竖向预算：header (~56px) + timer (~88px) + 棋盘外框 (~40px) + 余量。
    // 这个值比实际所需留得宽 —— 历史上还含一根底部按钮栏的约 75px，而那根栏已经删掉了。
    // 之所以不跟着调小：手机上棋盘尺寸实际由横向限制（0.86 × 视口宽）决定，
    // 只有极矮的屏幕才会撞到这里；留宽一点只是让它别成为瓶颈。
    const reservedHeight = isSm ? 320 : 270;
    const maxAllowedSize = isSm ? 420 : 380;
    
    const horizontalLimit = Math.min(windowSize.width * 0.86, maxAllowedSize);
    const verticalLimit = Math.max(150, Math.min(windowSize.height - reservedHeight, maxAllowedSize));
    
    const containerSize = Math.max(150, Math.min(horizontalLimit, verticalLimit));
    const compactGap = 3;
    const calculatedTileSize = Math.floor((containerSize - (maxDim - 1) * compactGap) / maxDim);
    const calculatedGap = Math.max(2, Math.min(3, Math.floor(calculatedTileSize / 22)));

    return { 
      tileSize: Math.max(calculatedTileSize, 26), 
      gap: calculatedGap 
    };
  }, [level.width, level.height, windowSize]);

  // 一次遍历建索引，替代原来每格调一次 path.findIndex 的 O(cells × path)。
  // 取用必须写 `?? -1`：起点格的 index 是 0，用 `||` 会被当成 -1，猫头/尾巴会直接渲染不出来。
  const pathIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    path.forEach((p, i) => map.set(p.y * level.width + p.x, i));
    return map;
  }, [path, level.width]);

  const getPathIndex = (x: number, y: number) => pathIndexMap.get(y * level.width + x) ?? -1;

  // Direction that the body faces based on drag into adjacent cell path[1]
  const tailDirection: 'up' | 'down' | 'left' | 'right' = useMemo(() => {
    if (path.length > 1) {
      const p0 = path[0];
      const p1 = path[1];
      if (p1.x > p0.x) return 'right';
      if (p1.x < p0.x) return 'left';
      if (p1.y > p0.y) return 'down';
      if (p1.y < p0.y) return 'up';
    }
    return 'up';
  }, [path]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const cellElement = target?.closest('[data-cell-x]');
    if (cellElement) {
      const x = parseInt(cellElement.getAttribute('data-cell-x') || '0', 10);
      const y = parseInt(cellElement.getAttribute('data-cell-y') || '0', 10);
      onCellMouseEnter({ x, y });
    }
  };

  return (
    <div 
      className="ui-board-frame relative select-none flex items-center justify-center"
    >
      <div 
        ref={gridRef}
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${level.width}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${level.height}, ${tileSize}px)`,
          // 两条都要写，顺序不能反：grid-gap 是 Chrome 61 认得的老名字，
          // gap 简写要 Chrome 66+。旧内核丢弃 gap、留下 grid-gap；
          // 新内核两条都认，写在后面的 gap 生效。格子一旦没了间距就会挤成一坨，这里不能只写一条。
          gridGap: `${gap}px`,
          gap: `${gap}px`,
          padding: `${gap + 3}px`,
          touchAction: 'none',
        }}
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => {
          if (e.cancelable) e.preventDefault(); 
          const touch = e.touches[0];
          const target = document.elementFromPoint(touch.clientX, touch.clientY);
          const cellElement = target?.closest('[data-cell-x]');
          if (cellElement) {
            const x = parseInt(cellElement.getAttribute('data-cell-x') || '0', 10);
            const y = parseInt(cellElement.getAttribute('data-cell-y') || '0', 10);
            onCellMouseDown({ x, y });
          }
        }}
      >
        {timeBonuses.map(bonus => {
          const isScore = bonus.type === 'score' || (!bonus.text.includes('s') && bonus.text.startsWith('+'));
          return (
            <div 
              key={bonus.id} 
              className="absolute animate-float-up pointer-events-none z-50 flex items-center justify-center" 
              style={{ 
                left: `${bonus.x * (tileSize + gap) + (tileSize / 2) - 40}px`, 
                top: `${bonus.y * (tileSize + gap) + (tileSize / 2) - 16}px`, 
                width: "80px", 
                height: "32px" 
              }}
            >
              <span 
                className={`border-2 border-white rounded-full px-2.5 py-0.5 text-white font-black text-sm shadow-md whitespace-nowrap ${
                  isScore ? "bg-[#F5A623]" : "bg-[#59A8E2]"
                }`}
              >
                {bonus.text}
              </span>
            </div>
          );
        })}

        {level.grid.map((row, y) => (
          row.map((cellType, x) => {
            const coordKey = `${x},${y}`;
            const pathIndex = getPathIndex(x, y);
            const isActive = cellType === CellType.TREAT 
              ? isTreatActive 
              : (cellType === CellType.YARN || cellType === CellType.STAR) 
              ? isYarnActive 
              : cellType === CellType.PLANT 
              ? isPlantActive 
              : cellType === CellType.BOX 
              ? isBoxActive 
              : true;
            // 拆成两个独立状态：Cell 需要用它们区分"被玩家吃掉"和"超时消失"两种退场动画
            const isCollected = collectedSet.has(coordKey);
            const isExpired = !isActive;
            const expiryMs = collectibleLifetimeMs(cellType, level.targetCount);

            const connections = { up: false, down: false, left: false, right: false };
            if (pathIndex !== -1) {
              const neighbors = [path[pathIndex - 1], path[pathIndex + 1]].filter(Boolean);
              neighbors.forEach(n => {
                if (n.x === x && n.y === y - 1) connections.up = true;
                if (n.x === x && n.y === y + 1) connections.down = true;
                if (n.x === x - 1 && n.y === y) connections.left = true;
                if (n.x === x + 1 && n.y === y) connections.right = true;
              });
            }

            let headDirection: 'up' | 'down' | 'left' | 'right' = 'right';
            if (pathIndex === path.length - 1 && path.length > 1) {
              const prev = path[path.length - 2];
              if (prev.x < x) headDirection = 'right'; 
              else if (prev.x > x) headDirection = 'left';
              else if (prev.y < y) headDirection = 'down'; 
              else if (prev.y > y) headDirection = 'up';
            }

            return (
              <div 
                key={`${x}-${y}`} 
                style={{ width: tileSize, height: tileSize }} 
                data-cell-x={x} 
                data-cell-y={y}
                className="relative"
              >
                <Cell
                  type={cellType}
                  isInPath={pathIndex !== -1}
                  isHead={pathIndex === path.length - 1 && path.length > 0}
                  isTail={pathIndex === 0 && path.length > 0}
                  isCollected={isCollected}
                  isExpired={isExpired}
                  pathIndex={pathIndex}
                  currentPathLength={path.length}
                  connections={connections}
                  headDirection={headDirection}
                  tailDirection={tailDirection}
                  levelStartTime={levelStartTime}
                  expiryMs={expiryMs}
                  rockVariant={level.rockVariants?.[coordKey]}
                  onMouseDown={() => onCellMouseDown({ x, y })}
                  onMouseEnter={() => onCellMouseEnter({ x, y })}
                  x={x} y={y} gridWidth={level.width} gridHeight={level.height}
                />
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};

export default Grid;
