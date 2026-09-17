/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { CellType } from './types';

export const GAME_CONSTANTS = {
  // Treats (🐟)
  TREAT_MIN_LIFETIME_MS: 4000,
  TREAT_SCALE_FACTOR_MS: 120, 
  
  // Yarn / Star (⭐)
  YARN_MIN_LIFETIME_MS: 3500,
  YARN_SCALE_FACTOR_MS: 120,

  // Plant (🪴)
  PLANT_MIN_LIFETIME_MS: 4500,
  PLANT_SCALE_FACTOR_MS: 120,

  // Mystery Box (🎁)
  BOX_MIN_LIFETIME_MS: 5000,
  BOX_SCALE_FACTOR_MS: 120,

  // Collectible Expiring Behavior
  COLLECTIBLE_WARNING_TIME_MS: 1500,

  // Game Timer
  INITIAL_TIME_SECONDS: 15,
  TREAT_TIME_BONUS_SECONDS: 5,
  
  // Scoring
  BASE_MOVE_SCORE: 10,
  TREAT_SCORE_BONUS: 0,
  YARN_SCORE_BONUS: 50,
  PLANT_SCORE_BONUS: 100, // 植物高难度积分道具
  BOX_SCORE_BONUS: 150,   // 宝箱高难度积分道具
  
  // Levels
  TOTAL_LEVELS: 12,
  BASE_GRID_SIZE: 4,
  MAX_GRID_SIZE: 6,
  LEVEL_WIN_DELAY_TIME_MS: 0,
  LEVEL_TRANSITION_TIME_MS: 400,

  // Level Generation Difficulty
  TARGET_DENSITY_BASE: 0.5,
  TARGET_DENSITY_INCREMENT: 0.03,
  TARGET_DENSITY_MAX: 0.9,
  
  // Collectible Limits
  MAX_COLLECTIBLES_PER_LEVEL: 3,
  WALLS_KILL_YOU: false,
};

/**
 * 单个奖励道具在关卡内的存活时长（毫秒）。
 * 注意：同类道具共享一个全局 active 布尔（见 App.tsx 的 isTreatActive 等），
 * 所以同关所有同类道具是"整组一起到期"，而不是各自计时。
 *
 * Grid（算每格 expiryMs）和 App（排到期定时器）必须走这一个函数，
 * 否则两处公式漂移会导致"预警抖动的时间和道具真正消失的时间对不上"。
 */
export const collectibleLifetimeMs = (type: CellType, targetCount: number): number => {
  switch (type) {
    case CellType.TREAT:
      return GAME_CONSTANTS.TREAT_MIN_LIFETIME_MS + targetCount * GAME_CONSTANTS.TREAT_SCALE_FACTOR_MS;
    case CellType.YARN:
    case CellType.STAR:
      return GAME_CONSTANTS.YARN_MIN_LIFETIME_MS + targetCount * GAME_CONSTANTS.YARN_SCALE_FACTOR_MS;
    case CellType.PLANT:
      return GAME_CONSTANTS.PLANT_MIN_LIFETIME_MS + targetCount * GAME_CONSTANTS.PLANT_SCALE_FACTOR_MS;
    case CellType.BOX:
      return GAME_CONSTANTS.BOX_MIN_LIFETIME_MS + targetCount * GAME_CONSTANTS.BOX_SCALE_FACTOR_MS;
    default:
      return 0;
  }
};

/**
 * 收集各类奖励道具的加分。TREAT 不给分（它给的是时间），所以是 0。
 * 显式列全，避免用 `else` 兜底把非道具格也算成得分。
 */
export const COLLECTIBLE_SCORE: Partial<Record<CellType, number>> = {
  [CellType.TREAT]: GAME_CONSTANTS.TREAT_SCORE_BONUS,
  [CellType.YARN]: GAME_CONSTANTS.YARN_SCORE_BONUS,
  [CellType.STAR]: GAME_CONSTANTS.YARN_SCORE_BONUS,
  [CellType.PLANT]: GAME_CONSTANTS.PLANT_SCORE_BONUS,
  [CellType.BOX]: GAME_CONSTANTS.BOX_SCORE_BONUS,
};

/** 判断某个格子类型是否是可收集的奖励道具。 */
export const isCollectibleType = (type: CellType): boolean =>
  type === CellType.TREAT ||
  type === CellType.YARN ||
  type === CellType.STAR ||
  type === CellType.PLANT ||
  type === CellType.BOX;
