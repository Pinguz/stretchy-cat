/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateLevel } from './logic/levelGenerator';
import { Point, CellType, LevelData, GameState } from './types';
import Grid from './components/Grid';
import GameOver from './components/GameOver';
import { GAME_CONSTANTS } from './constants';
import { useKeyboardControls } from './hooks/useKeyboardControls';

import useAudio from "./services/audioService";
import { getPath } from "./utils/path";
import InfoDialog from './components/InfoDialog';

const App: React.FC = () => {
  const [hasStarted] = useState(true);
  const [timerStarted, setTimerStarted] = useState(false);
  const [levelIndex, setLevelIndex] = useState(1);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [level, setLevel] = useState<LevelData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(GAME_CONSTANTS.INITIAL_TIME_SECONDS);
  const [showInfo, setShowInfo] = useState(false);
  
  const collectedMap = useRef<Set<string>>(new Set());
  const isTransitioningRef = useRef(false);
  const isWinProcessed = useRef(false);

  const [gameState, setGameState] = useState<GameState>({
    path: [], 
    isWon: false, 
    isDragging: false, 
    score: 0, 
    levelStartScore: 0, 
    multiplier: 1, 
    treats: 0, 
    collectedItems: []
  });
  
  const [timeBonuses, setTimeBonuses] = useState<{id: number; x: number; y: number; text: string; color: string; type?: 'time' | 'score'}[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number>(0);

  const isPaused = false;

  const { playForeground, preloadCache, soundEnabled, toggleSound } = useAudio();
  const audioFiles = [
    getPath("/media/audio/sfx/stretchycat/backspace.mp3"),
    getPath("/media/audio/sfx/stretchycat/stretchspace.mp3"),
    getPath("/media/audio/sfx/stretchycat/YarnReward.mp3"),
    getPath("/media/audio/sfx/stretchycat/FishReward.mp3"),
    getPath("/media/audio/sfx/stretchycat/goal.mp3"),
    getPath("/media/audio/sfx/global/win.mp3"),
  ];

  useEffect(() => {
    const parent = document.getElementById('puzzle-game-container');
    if (parent) {
      parent.style.position = 'relative';
      parent.style.height = '100vh';
      parent.style.width = '100vw';
      parent.style.overflow = 'hidden';
      parent.style.display = 'block';
    }
  }, []);

  useEffect(() => { 
    preloadCache(audioFiles); 
  }, []);

  const [isTreatActive, setIsTreatActive] = useState(true);
  const [isYarnActive, setIsYarnActive] = useState(true);
  const [isPlantActive, setIsPlantActive] = useState(true);
  const [isBoxActive, setIsBoxActive] = useState(true);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);

  useEffect(() => {
    if (isPaused) {
      if (pauseStartTime === 0) setPauseStartTime(Date.now());
    } else if (pauseStartTime > 0) {
      const diff = Date.now() - pauseStartTime;
      setLevelStartTime(prev => (prev > 0 ? prev + diff : 0));
      setPauseStartTime(0);
    }
  }, [isPaused, pauseStartTime]);

  const initLevel = useCallback(async (index: number) => {
    setIsTransitioning(true);
    isTransitioningRef.current = true;
    isWinProcessed.current = false;
    const newLevel = generateLevel(index);
    setLevelStartTime(0);

    setTimeout(() => {
      collectedMap.current.clear();
      setLevel(newLevel);
      setIsTreatActive(true);
      setIsYarnActive(true);
      setIsPlantActive(true);
      setIsBoxActive(true);
      setPauseStartTime(0);
      setTimerStarted(false);
      setTimeLeft(GAME_CONSTANTS.INITIAL_TIME_SECONDS);
      setGameState(prev => ({
        ...prev, 
        path: [newLevel.startPoint], 
        isWon: false, 
        isDragging: false, 
        levelStartScore: prev.score,
        multiplier: 1, 
        treats: 0, 
        collectedItems: []
      }));
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, GAME_CONSTANTS.LEVEL_TRANSITION_TIME_MS);
  }, []);

  const handleFullReset = useCallback(() => {
    setGameResult(null);
    setTimeLeft(GAME_CONSTANTS.INITIAL_TIME_SECONDS);
    collectedMap.current.clear();
    isWinProcessed.current = false;
    if (levelIndex === 1) {
      initLevel(1);
    } else {
      setLevelIndex(1);
    }
  }, [levelIndex, initLevel]);

  const restartCurrentLevel = useCallback(() => {
    if (!level) return;
    setIsTreatActive(true);
    setIsYarnActive(true);
    setIsPlantActive(true);
    setIsBoxActive(true);
    collectedMap.current.clear();
    isWinProcessed.current = false;
    setLevelStartTime(0);
    setTimeLeft(GAME_CONSTANTS.INITIAL_TIME_SECONDS);
    setTimerStarted(false);
    setGameState(prev => ({
      ...prev, 
      path: [level.startPoint], 
      isWon: false, 
      isDragging: false, 
      score: prev.levelStartScore, 
      multiplier: 1, 
      treats: 0, 
      collectedItems: []
    }));
  }, [level]);

  const resetCatPosition = useCallback(() => {
    if (!level) return;
    collectedMap.current.clear();
    isWinProcessed.current = false;
    // Keep timeLeft and timerStarted intact so countdown continues uninterrupted!
    setGameState(prev => ({
      ...prev, 
      path: [level.startPoint], 
      isWon: false, 
      isDragging: false, 
      score: prev.levelStartScore, 
      multiplier: 1, 
      treats: 0, 
      collectedItems: []
    }));
    playForeground(getPath("/media/audio/sfx/stretchycat/backspace.mp3"));
  }, [level, playForeground]);

  useEffect(() => {
    if (!isTreatActive || isPaused || pauseStartTime > 0 || !hasStarted || isTransitioning || gameState.isWon || !level || levelStartTime === 0) return; 
    const totalLifetime = GAME_CONSTANTS.TREAT_MIN_LIFETIME_MS + (level.targetCount * GAME_CONSTANTS.TREAT_SCALE_FACTOR_MS);
    const elapsed = Date.now() - levelStartTime;
    const remaining = totalLifetime - elapsed;

    if (remaining <= 0) {
      setIsTreatActive(false);
    } else {
      const timer = setTimeout(() => setIsTreatActive(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [isTreatActive, hasStarted, isTransitioning, gameState.isWon, level, levelStartTime, isPaused, pauseStartTime]);

  useEffect(() => {
    if (!isYarnActive || isPaused || pauseStartTime > 0 || !hasStarted || isTransitioning || gameState.isWon || !level || levelStartTime === 0) return; 
    const totalLifetime = GAME_CONSTANTS.YARN_MIN_LIFETIME_MS + (level.targetCount * GAME_CONSTANTS.YARN_SCALE_FACTOR_MS);
    const elapsed = Date.now() - levelStartTime;
    const remaining = totalLifetime - elapsed;

    if (remaining <= 0) {
      setIsYarnActive(false);
    } else {
      const timer = setTimeout(() => setIsYarnActive(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [isYarnActive, hasStarted, isTransitioning, gameState.isWon, level, levelStartTime, isPaused, pauseStartTime]);

  useEffect(() => {
    if (!isPlantActive || isPaused || pauseStartTime > 0 || !hasStarted || isTransitioning || gameState.isWon || !level || levelStartTime === 0) return; 
    const totalLifetime = GAME_CONSTANTS.PLANT_MIN_LIFETIME_MS + (level.targetCount * GAME_CONSTANTS.PLANT_SCALE_FACTOR_MS);
    const elapsed = Date.now() - levelStartTime;
    const remaining = totalLifetime - elapsed;

    if (remaining <= 0) {
      setIsPlantActive(false);
    } else {
      const timer = setTimeout(() => setIsPlantActive(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [isPlantActive, hasStarted, isTransitioning, gameState.isWon, level, levelStartTime, isPaused, pauseStartTime]);

  useEffect(() => {
    if (!isBoxActive || isPaused || pauseStartTime > 0 || !hasStarted || isTransitioning || gameState.isWon || !level || levelStartTime === 0) return; 
    const totalLifetime = GAME_CONSTANTS.BOX_MIN_LIFETIME_MS + (level.targetCount * GAME_CONSTANTS.BOX_SCALE_FACTOR_MS);
    const elapsed = Date.now() - levelStartTime;
    const remaining = totalLifetime - elapsed;

    if (remaining <= 0) {
      setIsBoxActive(false);
    } else {
      const timer = setTimeout(() => setIsBoxActive(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [isBoxActive, hasStarted, isTransitioning, gameState.isWon, level, levelStartTime, isPaused, pauseStartTime]);

  useEffect(() => {
    if (hasStarted && !isTransitioning && !gameState.isWon && !isPaused && !timerStarted) {
      if (gameState.path.length > 1 || (!isTreatActive && !isYarnActive && !isPlantActive && !isBoxActive)) setTimerStarted(true);
    }
  }, [isTreatActive, isYarnActive, isPlantActive, isBoxActive, timerStarted, hasStarted, isTransitioning, gameState.isWon, isPaused, gameState.path.length]);

  useEffect(() => {
    if (!hasStarted || isTransitioning || gameState.isWon || timeLeft === null || !timerStarted || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isTransitioning, gameState.isWon, timeLeft, timerStarted, isPaused]);

  useEffect(() => {
    if (timeLeft === 0 && !gameState.isWon && hasStarted && !isTransitioning && !gameResult) {
      setGameResult('lose');
    }
  }, [timeLeft, gameState.isWon, hasStarted, isTransitioning, gameResult]);

  useEffect(() => { 
    if (hasStarted) initLevel(levelIndex); 
  }, [levelIndex, hasStarted]);

  const handleCellInteraction = (p: Point) => {
    if (isTransitioningRef.current || isWinProcessed.current || isPaused || gameResult) return;
    
    if (levelStartTime === 0) {
      const last = gameState.path[gameState.path.length - 1];
      if (last) {
        const isAdjacent = Math.abs(last.x - p.x) + Math.abs(last.y - p.y) === 1;
        if (isAdjacent) setLevelStartTime(Date.now());
      }
    }

    setGameState(prev => {
      if (!level || prev.isWon || prev.path.length === 0) return prev;
      const path = prev.path;
      const last = path[path.length - 1];
      const secondLast = path[path.length - 2];
      const isAdjacent = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
      if (!isAdjacent(last, p)) return prev;
      if (secondLast && p.x === secondLast.x && p.y === secondLast.y) {
        playForeground(getPath("/media/audio/sfx/stretchycat/backspace.mp3"));
        return { 
          ...prev, 
          path: path.slice(0, -1), 
          score: Math.max(prev.levelStartScore, prev.score - GAME_CONSTANTS.BASE_MOVE_SCORE) 
        };
      }
      const cellType = level.grid[p.y][p.x];
      const cellKey = `${p.x},${p.y}`;
      if (path.some(pt => pt.x === p.x && pt.y === p.y)) return prev; 
      if ([CellType.ROCK, CellType.BUSH, CellType.COUCH].includes(cellType)) return prev;
      if (cellType === CellType.WATER) { 
        setTimeout(restartCurrentLevel, 0); 
        return prev; 
      }
      const newPath = [...path, p];
      let scoreAdd = GAME_CONSTANTS.BASE_MOVE_SCORE;
      let newTreats = prev.treats;
      
      const isCollectible = (cellType === CellType.TREAT && isTreatActive) ||
                            ((cellType === CellType.YARN || cellType === CellType.STAR) && isYarnActive) ||
                            (cellType === CellType.PLANT && isPlantActive) ||
                            (cellType === CellType.BOX && isBoxActive);

      if (isCollectible) {
        if (!collectedMap.current.has(cellKey)) {
          collectedMap.current.add(cellKey);
          const bid = Date.now();
          if (cellType === CellType.TREAT) {
            playForeground(getPath("/media/audio/sfx/stretchycat/FishReward.mp3"));
            setTimeout(() => setTimeLeft(t => (t !== null ? t + GAME_CONSTANTS.TREAT_TIME_BONUS_SECONDS : t)), 0);
            newTreats += 1;
            setTimeBonuses(b => [...b, { id: bid, x: p.x, y: p.y, text: `+5s`, color: 'text-white', type: 'time' }]);
            setTimeout(() => setTimeBonuses(b => b.filter(i => i.id !== bid)), 2000);
          } else if (cellType === CellType.PLANT) {
            playForeground(getPath("/media/audio/sfx/stretchycat/YarnReward.mp3"));
            scoreAdd += GAME_CONSTANTS.PLANT_SCORE_BONUS;
            setTimeBonuses(b => [...b, { id: bid, x: p.x, y: p.y, text: `+${GAME_CONSTANTS.PLANT_SCORE_BONUS}`, color: 'text-white', type: 'score' }]);
            setTimeout(() => setTimeBonuses(b => b.filter(i => i.id !== bid)), 2000);
          } else if (cellType === CellType.BOX) {
            playForeground(getPath("/media/audio/sfx/stretchycat/YarnReward.mp3"));
            scoreAdd += GAME_CONSTANTS.BOX_SCORE_BONUS;
            setTimeBonuses(b => [...b, { id: bid, x: p.x, y: p.y, text: `+${GAME_CONSTANTS.BOX_SCORE_BONUS}`, color: 'text-white', type: 'score' }]);
            setTimeout(() => setTimeBonuses(b => b.filter(i => i.id !== bid)), 2000);
          } else {
            playForeground(getPath("/media/audio/sfx/stretchycat/YarnReward.mp3"));
            scoreAdd += GAME_CONSTANTS.YARN_SCORE_BONUS;
            setTimeBonuses(b => [...b, { id: bid, x: p.x, y: p.y, text: `+${GAME_CONSTANTS.YARN_SCORE_BONUS}`, color: 'text-white', type: 'score' }]);
            setTimeout(() => setTimeBonuses(b => b.filter(i => i.id !== bid)), 2000);
          }
        }
      } else { 
        playForeground(getPath("/media/audio/sfx/stretchycat/stretchspace.mp3")); 
      }
      const won = newPath.length === level.targetCount && cellType === CellType.SAUCER;
      if (won && !isWinProcessed.current) {
        isWinProcessed.current = true;
        isTransitioningRef.current = true;
        setTimeBonuses([]);
        playForeground(getPath("/media/audio/sfx/stretchycat/goal.mp3"));
        setTimeout(() => {
          if (levelIndex >= GAME_CONSTANTS.TOTAL_LEVELS) {
            setGameResult('win');
            playForeground(getPath("/media/audio/sfx/global/win.mp3"));
          } else { 
            setLevelIndex(idx => idx + 1); 
          }
        }, 350);
      }
      return { 
        ...prev, 
        path: newPath, 
        isWon: won, 
        score: prev.score + scoreAdd, 
        treats: newTreats, 
        collectedItems: [...prev.collectedItems, cellKey] 
      };
    });
  };

  useKeyboardControls((direction) => {
    if (!hasStarted || gameResult || isTransitioning || !level || gameState.isWon || isPaused) return;
    const currentHead = gameState.path[gameState.path.length - 1];
    if (!currentHead) return;
    const newPos = { x: currentHead.x + direction.x, y: currentHead.y + direction.y };
    if (newPos.x >= 0 && newPos.x < level.width && newPos.y >= 0 && newPos.y < level.height) {
      handleCellInteraction(newPos);
    }
  });

  if (!level) return null;

  return (
    <div 
      className="game-scene relative w-full max-w-full h-screen h-[100dvh] overflow-hidden select-none font-sans flex flex-col justify-between items-center bg-[#9BD7FD]"
      onMouseUp={() => setGameState(prev => ({ ...prev, isDragging: false }))}
    >
      <img
        src="/assets/ui_signpost.png"
        alt=""
        aria-hidden="true"
        className="game-decor-sign absolute left-[8px] z-0 block w-[72px] pointer-events-none select-none sm:left-[3%] sm:w-[110px]"
      />
      <img
        src="/assets/ui_cat_sleep.png"
        alt=""
        aria-hidden="true"
        className="game-decor-cat absolute right-[8px] z-0 block w-[108px] pointer-events-none select-none drop-shadow-[0_2px_3px_rgba(72,72,45,0.28)] sm:right-[3%] sm:w-[150px]"
      />

      <style>{`
        @keyframes floatUpFade { 
          0% { transform: translateY(0) scale(1); opacity: 1; } 
          100% { transform: translateY(-35px) scale(1.3); opacity: 0; } 
        }
        .animate-float-up { animation: floatUpFade 1.8s ease-out forwards; }
      `}</style>

      {/* GameOver Modal */}
      {gameResult && (
        <GameOver 
          type={gameResult} 
          score={gameState.score} 
          onAction={handleFullReset} 
        />
      )}

      {/* Info/Rules Dialog */}
      <InfoDialog 
        isOpen={showInfo} 
        onClose={() => setShowInfo(false)} 
      />

      {/* TOP HEADER */}
      <header className="game-header fixed right-3 z-30 flex items-center gap-1.5 sm:right-4 sm:gap-2">
        {/* Right: Authentic Sound & Settings PNG Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform filter drop-shadow-xs"
            title={soundEnabled ? "静音音效" : "开启音效"}
          >
            <img 
              src="/assets/ui_btn_volume.png" 
              alt="Volume" 
              className={`w-full h-full object-contain ${!soundEnabled ? 'opacity-50 grayscale' : ''}`} 
            />
            {!soundEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-red-500 rotate-45 rounded-full shadow-xs" />
              </div>
            )}
          </button>

          {/* Settings / Rules button */}
          <button
            onClick={() => setShowInfo(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform filter drop-shadow-xs"
            title="游戏说明与帮助"
          >
            <img 
              src="/assets/ui_btn_settings.png" 
              alt="Settings" 
              className="w-full h-full object-contain" 
            />
          </button>
        </div>
      </header>

      {/* MAIN GAME AREA */}
      <main className="game-main relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-3 w-full max-w-[480px]">
        {/* Main Board & Timer Container - shifted up on both mobile (-30px) and desktop (-16px) to avoid footer overlap */}
        <div className="game-main-content relative flex flex-col items-center w-full">
          {/* Animated Board Container (Only the board scales/fades when switching levels) */}
          <div className={`transition-all duration-300 transform ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} flex flex-col items-center w-full`}>
            <div className="relative">
              <div className="absolute bottom-[calc(100%+7.5px)] left-0 z-20 flex items-end gap-[3px] sm:gap-1">
                <div className="relative w-[116px] sm:w-[140px] aspect-[271/196] flex items-center justify-center shrink-0">
                  <img 
                    src="/assets/ui_level_banner.png" 
                    alt="Level Banner" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none filter drop-shadow-sm" 
                  />
                  <div className="absolute left-0 top-[75%] z-10 flex w-full -translate-y-1/2 items-center justify-center">
                    <span className="text-[#654327] font-black text-[14px] leading-none whitespace-nowrap">
                      Level <strong className="text-[#E0533B] font-black">{levelIndex}</strong>/{GAME_CONSTANTS.TOTAL_LEVELS}
                    </span>
                  </div>
                </div>
                <div className="relative w-[122px] h-[42px] sm:w-[148px] sm:h-[51px] aspect-[284/98] flex items-center justify-center shrink-0">
                  <img
                    src="/assets/ui_points_badge.png"
                    alt="Points"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none filter drop-shadow-sm"
                  />
                  <div className="absolute inset-0 z-10">
                    <img
                      src="/assets/award_star.png"
                      alt=""
                      aria-hidden="true"
                      className="absolute left-[10px] top-1/2 h-[52%] w-[22%] -translate-y-1/2 scale-[0.81] object-contain pointer-events-none select-none sm:left-[12px]"
                    />
                    <span className="absolute left-[34.5%] top-1/2 -translate-y-1/2 text-left text-[#523319] font-black text-[14px] leading-none tabular-nums whitespace-nowrap">
                      {gameState.score.toLocaleString()}
                      <span className="text-[#856143] font-black text-[12px] ml-1">积分</span>
                    </span>
                  </div>
                </div>
              </div>
              <Grid
                level={level}
                path={gameState.path}
                collectedMap={collectedMap.current}
                timeBonuses={timeBonuses}
                isTreatActive={isTreatActive}
                isYarnActive={isYarnActive}
                isPlantActive={isPlantActive}
                isBoxActive={isBoxActive}
                levelStartTime={levelStartTime}
                onCellMouseDown={(p) => { 
                  if (!isTransitioning && !isWinProcessed.current && !isPaused) { 
                    setGameState(prev => ({ ...prev, isDragging: true })); 
                    handleCellInteraction(p); 
                  } 
                }}
                onCellMouseEnter={(p) => { 
                  if (gameState.isDragging && !isTransitioning && !isWinProcessed.current && !isPaused) {
                    handleCellInteraction(p); 
                  }
                }}
              />
            </div>
          </div>

          {/* TIMER BADGE (Independent of level switching animation - DOES NOT scale or fade) */}
          {timeLeft !== null && (
            <div className="relative w-[184px] sm:w-[207px] aspect-[315/153] flex items-center justify-center mt-1 sm:mt-1.5 shrink-0">
              <img 
                src="/assets/ui_timer.png" 
                alt="Timer" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none filter drop-shadow-sm" 
              />
              <div className="relative z-10 pl-[23%] -translate-x-[10px] translate-y-0.5 flex items-center justify-center">
                <span className="text-[#59371D] font-black text-[21px] sm:text-[23px] tabular-nums leading-none tracking-wide">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetCatPosition();
                }}
                className="absolute left-[calc(100%+8px)] top-1/2 z-10 h-[42px] w-[110px] -translate-y-1/2 cursor-pointer active:scale-95 hover:brightness-105 transition-transform sm:h-[51px] sm:w-[135px]"
                title="重置猫咪位置"
                aria-label="重置猫咪位置"
              >
                <img
                  src="/assets/ui_btn_reset.png"
                  alt="重置"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </button>
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default App;
