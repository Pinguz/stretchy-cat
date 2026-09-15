/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { CellType, Point, LevelData } from '../types';
import { GAME_CONSTANTS } from '../constants';

/**
 * Assign unique non-repeating rock variants (1-7) to all rock obstacles in the level.
 * Guarantees that rocks in the same level do not repeat the same image unless there are > 7 rocks.
 */
const assignRockVariants = (grid: CellType[][], width: number, height: number): Record<string, number> => {
  const rockPositions: Point[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === CellType.ROCK) {
        rockPositions.push({ x, y });
      }
    }
  }

  const rockVariants: Record<string, number> = {};
  let pool: number[] = [];
  const shufflePool = () => {
    // Fisher-Yates shuffle of variants 1 to 7
    const items = [1, 2, 3, 4, 5, 6, 7];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };

  for (const pos of rockPositions) {
    if (pool.length === 0) {
      pool = shufflePool();
    }
    rockVariants[`${pos.x},${pos.y}`] = pool.pop()!;
  }

  return rockVariants;
};

/**
 * Generates a level by first constructing a Hamiltonian path on a subset of the grid.
 */
export const generateLevel = (levelIndex: number): LevelData => {
  const baseSize = GAME_CONSTANTS.BASE_GRID_SIZE;
  const growth = Math.floor((levelIndex - 1) / 3);
  const width = Math.min(GAME_CONSTANTS.MAX_GRID_SIZE, baseSize + growth);
  const height = Math.min(GAME_CONSTANTS.MAX_GRID_SIZE, baseSize + growth);
  
  // Higher level = more dense path
  const targetDensity = Math.min(
    GAME_CONSTANTS.TARGET_DENSITY_MAX, 
    GAME_CONSTANTS.TARGET_DENSITY_BASE + (levelIndex * GAME_CONSTANTS.TARGET_DENSITY_INCREMENT)
  );
  const targetLength = Math.floor(width * height * targetDensity);

  let attempts = 0;
  while (attempts < 200) {
    attempts++;
    
    // Non-path cells default to ROCK obstacles
    const grid: CellType[][] = Array.from({ length: height }, () => 
      Array.from({ length: width }, () => CellType.ROCK)
    );

    const startPoint = { 
      x: Math.floor(Math.random() * width), 
      y: Math.floor(Math.random() * height) 
    };

    const path: Point[] = [startPoint];
    const visited = new Set<string>([`${startPoint.x},${startPoint.y}`]);

    // Randomized DFS to find a Hamiltonian path of targetLength
    const findPath = (curr: Point): boolean => {
      if (path.length === targetLength) return true;

      const neighbors = [
        { x: curr.x + 1, y: curr.y },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x, y: curr.y - 1 }
      ].filter(n => 
        n.x >= 0 && n.x < width && n.y >= 0 && n.y < height && 
        !visited.has(`${n.x},${n.y}`)
      );

      // Shuffle neighbors for variety
      for (let i = neighbors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
      }

      for (const next of neighbors) {
        visited.add(`${next.x},${next.y}`);
        path.push(next);
        if (findPath(next)) return true;
        path.pop();
        visited.delete(`${next.x},${next.y}`);
      }

      return false;
    };

    if (findPath(startPoint)) {
      // 1. Mark path cells in grid
      path.forEach((p, idx) => {
        if (idx === 0) {
          grid[p.y][p.x] = CellType.START;
        } else if (idx === path.length - 1) {
          grid[p.y][p.x] = CellType.SAUCER;
        } else {
          grid[p.y][p.x] = CellType.EMPTY;
        }
      });

      // 2. Scatter collectibles on the path
      let collectiblesPlaced = 0;
      const pathIndices = Array.from({ length: path.length - 2 }, (_, i) => i + 1);
      for (let i = pathIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pathIndices[i], pathIndices[j]] = [pathIndices[j], pathIndices[i]];
      }

      for (const idx of pathIndices) {
        if (collectiblesPlaced >= GAME_CONSTANTS.MAX_COLLECTIBLES_PER_LEVEL) break;
        
        if (Math.random() < 0.32) {
          const p = path[idx];
          
          // Difficulty scaling for collectibles:
          // Level 5+: Mystery Box (tile_box.png, +150) and Plant (tile_plant.png, +100)
          // Level 3+: Plant (+100) can appear
          // Level 1-2: Fish (treat) and Star (yarn)
          const roll = Math.random();
          if (levelIndex >= 5 && roll < 0.3) {
            grid[p.y][p.x] = CellType.BOX;
          } else if (levelIndex >= 3 && roll < 0.55) {
            grid[p.y][p.x] = CellType.PLANT;
          } else if (roll < 0.75) {
            grid[p.y][p.x] = CellType.YARN;
          } else {
            grid[p.y][p.x] = CellType.TREAT;
          }
          collectiblesPlaced++;
        }
      }

      // 3. Decorate non-path obstacle cells: primarily tile_bush.png and tile_rock_01~07.png
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (grid[y][x] === CellType.ROCK) {
            // 35% bushes, 65% rocks
            grid[y][x] = ((x * 4 + y * 7) % 5 === 0) ? CellType.BUSH : CellType.ROCK;
          }
        }
      }

      return {
        id: levelIndex,
        width,
        height,
        grid,
        startPoint,
        targetCount: path.length,
        title: `Room ${levelIndex}`,
        flavor: levelIndex > 10 ? "A true test of flexibility!" : "Just a cozy little stretch.",
        roomTheme: '#FFFFFF',
        rockVariants: assignRockVariants(grid, width, height)
      };
    }
  }

  // Fallback (simple 4x4)
  const fallbackGrid = [
    [CellType.START, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY],
    [CellType.BUSH, CellType.ROCK, CellType.ROCK, CellType.EMPTY],
    [CellType.EMPTY, CellType.EMPTY, CellType.EMPTY, CellType.EMPTY],
    [CellType.EMPTY, CellType.SAUCER, CellType.ROCK, CellType.BUSH]
  ];

  return {
    id: levelIndex,
    width: 4,
    height: 4,
    grid: fallbackGrid,
    startPoint: { x: 0, y: 0 },
    targetCount: 9,
    title: `Room ${levelIndex}`,
    flavor: "Back to basics.",
    roomTheme: '#FFFFFF',
    rockVariants: assignRockVariants(fallbackGrid, 4, 4)
  };
};
