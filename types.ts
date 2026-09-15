/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum CellType {
  EMPTY = 'empty',
  START = 'start',
  // Hazards
  WATER = 'water',   // Resets path
  // Obstacles (主要是灌木与岩石)
  ROCK = 'rock',     // Rock blocker (tile_rock_01 ~ 07)
  BUSH = 'bush',     // Bush blocker (tile_bush)
  COUCH = 'couch',   // Compatible alias for bush
  // Collectibles (积分道具)
  TREAT = 'treat',   // Fish (+5s time boost)
  YARN = 'yarn',     // Star (+50 points)
  STAR = 'star',     // Star (+50 points)
  PLANT = 'plant',   // Plant bonus item (+100 points, appears in harder levels)
  BOX = 'box',       // Mystery box bonus item (+150 points, appears in harder levels)
  // Objectives
  SAUCER = 'saucer'
}

export interface Point {
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  width: number;
  height: number;
  grid: CellType[][];
  startPoint: Point;
  targetCount: number;
  title: string;
  flavor: string;
  roomTheme: string;
  rockVariants?: Record<string, number>; // Maps "x,y" to rock variant number 1-7 (non-repeating per level)
}

export interface GameState {
  path: Point[];
  isWon: boolean;
  isDragging: boolean;
  score: number;
  levelStartScore: number;
  multiplier: number;
  treats: number;
  collectedItems: string[]; // Stores coordinates "x,y" of collected items
}
