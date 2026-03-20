import { useState, useRef, useEffect, useCallback } from 'react';

const COLS = 26;
const ROWS = 26;
const SPEED = { easy: 180, normal: 120, hard: 75 };

export function useGameState() {
  const [currentScreen, setCurrentScreen] = useState('start');
  const [snake, setSnake] = useState([]);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [nextDir, setNextDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 12, y: 12 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snakeHS') || '0'));
  const [difficulty, setDifficulty] = useState('easy');
  const [paused, setPaused] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ cell: 12, board: 312 });
  const [activeDirection, setActiveDirection] = useState(null);

  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gameLoopRef = useRef(null);
  const touchStartRef = useRef(null);
  const startTimeRef = useRef(null);
  const snakeRef = useRef([]);
  const dirRef = useRef({ x: 1, y: 0 });
  const nextDirRef = useRef({ x: 1, y: 0 });
  const pausedRef = useRef(false);
  const gameRunningRef = useRef(false);
  const foodRef = useRef({ x: 12, y: 12 });
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const difficultyRef = useRef('easy');

  const unlockAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playEatSound = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const freqs = [520, 780];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.12);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.12);
    });
  }, []);

  const resizeCanvas = useCallback(() => {
    // GBA phone: 460×820
    // Screen inner: 360px tall after bezel padding
    // Score bar: 28px, gap: 4px → canvas gets 328px
    const availH = 328;
    const availW = 392;
    const size = Math.min(availH, availW);
    let cell = Math.floor(size / ROWS);
    cell = Math.min(cell, 28);
    cell = Math.max(cell, 10);
    const board = cell * ROWS;
    setCanvasSize({ cell, board });
    return { cell, board };
  }, []);

  const spawnFood = useCallback((currentSnake) => {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (currentSnake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const initGame = useCallback(() => {
    const cx = Math.floor(COLS / 2);
    const cy = Math.floor(ROWS / 2);
    const initialSnake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    snakeRef.current = initialSnake;
    setSnake(initialSnake);
    dirRef.current = { x: 1, y: 0 };
    setDir({ x: 1, y: 0 });
    nextDirRef.current = { x: 1, y: 0 };
    setNextDir({ x: 1, y: 0 });
    scoreRef.current = 0;
    setScore(0);
    levelRef.current = 1;
    setLevel(1);
    setPaused(false);
    pausedRef.current = false;
    setGameRunning(true);
    gameRunningRef.current = true;
    startTimeRef.current = Date.now();
    setElapsed(0);
    setIsNewRecord(false);
    setActiveDirection(null);
    const newFood = spawnFood(initialSnake);
    foodRef.current = newFood;
    setFood(newFood);
    resizeCanvas();
  }, [spawnFood, resizeCanvas]);

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { cell } = canvasSize;
    const currentSnake = snakeRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#060D0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#0E1A10';
    ctx.lineWidth = 0.5;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cell, 0);
      ctx.lineTo(c * cell, canvas.height);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cell);
      ctx.lineTo(canvas.width, r * cell);
      ctx.stroke();
    }

    currentSnake.forEach((seg, i) => {
      const alpha = i === 0 ? 1 : Math.max(0.5, 1 - i * 0.04);
      ctx.fillStyle = `rgba(50, 215, 75, ${alpha})`;
      if (i === 0) {
        ctx.shadowColor = '#32D74B';
        ctx.shadowBlur = 16;
      } else {
        ctx.shadowBlur = i < 3 ? 7 : 0;
        ctx.shadowColor = '#32D74B';
      }
      roundRect(ctx, seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2, 5);
      ctx.shadowBlur = 0;

      if (i === 0) {
        ctx.fillStyle = '#0C0C0C';
        const ex = seg.x * cell + cell / 2;
        const ey = seg.y * cell + cell / 2;
        const eyeSize = 3.5;
        const offX = dirRef.current.x * 4;
        const offY = dirRef.current.y * 4;
        const perpX = dirRef.current.y * 4;
        const perpY = dirRef.current.x * 4;
        ctx.beginPath();
        ctx.arc(ex + offX + perpX, ey + offY + perpY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex + offX - perpX, ey + offY - perpY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const currentFood = foodRef.current;
    const fx = currentFood.x * cell + cell / 2;
    const fy = currentFood.y * cell + cell / 2;
    const t = Date.now() / 500;
    const pulse = 1 + 0.12 * Math.sin(t);
    ctx.shadowColor = '#FF3B30';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF3B30';
    ctx.beginPath();
    ctx.arc(fx, fy, (cell / 2 - 2) * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const glowR = cell * 0.18;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(fx - glowR, fy - glowR, glowR, 0, Math.PI * 2);
    ctx.fill();
  }, [canvasSize]);

  const tick = useCallback(() => {
    if (pausedRef.current || !gameRunningRef.current) return;

    const currentDir = { ...nextDirRef.current };
    dirRef.current = currentDir;
    setDir(currentDir);

    const head = {
      x: snakeRef.current[0].x + currentDir.x,
      y: snakeRef.current[0].y + currentDir.y
    };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      endGameRef.current();
      return;
    }
    if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
      endGameRef.current();
      return;
    }

    const newSnake = [head, ...snakeRef.current];
    snakeRef.current = newSnake;
    setSnake([...newSnake]);

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      const newScore = scoreRef.current + 10 * levelRef.current;
      const newLevel = Math.floor(newScore / 100) + 1;
      scoreRef.current = newScore;
      levelRef.current = newLevel;
      setScore(newScore);
      setLevel(newLevel);
      playEatSound();
      const newFood = spawnFood(newSnake);
      foodRef.current = newFood;
      setFood(newFood);
      restartLoopRef.current(newLevel);
    } else {
      snakeRef.current = newSnake.slice(0, -1);
      setSnake([...snakeRef.current]);
    }

    draw();
  }, [playEatSound, spawnFood, draw]);

  const endGameRef = useRef(null);
  const restartLoopRef = useRef(null);

  const endGame = useCallback(() => {
    setGameRunning(false);
    gameRunningRef.current = false;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);

    const finalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setElapsed(finalElapsed);

    const currentScore = scoreRef.current;
    const currentHighScore = highScore;
    const isNew = currentScore > currentHighScore;
    if (isNew) {
      setHighScore(currentScore);
      setIsNewRecord(true);
      localStorage.setItem('snakeHS', currentScore.toString());
    }

    setTimeout(() => setCurrentScreen('gameover'), 400);
  }, [highScore]);

  endGameRef.current = endGame;

  const restartLoop = useCallback((currentLevel) => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    const speed = Math.max(50, SPEED[difficultyRef.current] - (currentLevel - 1) * 8);
    gameLoopRef.current = setInterval(tick, speed);
  }, [tick]);

  restartLoopRef.current = restartLoop;

  const togglePause = useCallback(() => {
    if (!gameRunningRef.current) return;
    const newPaused = !pausedRef.current;
    pausedRef.current = newPaused;
    setPaused(newPaused);
    if (!newPaused) {
      restartLoopRef.current(levelRef.current);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  }, []);

  const changeDir = useCallback((direction) => {
    const DIRS = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const nd = DIRS[direction];
    if (!nd) return;
    if (nd.x === -dirRef.current.x && nd.y === -dirRef.current.y) return;
    nextDirRef.current = nd;
    setNextDir(nd);
    setActiveDirection(direction);
    setTimeout(() => setActiveDirection(null), 200);
  }, []);

  const startGame = useCallback(() => {
    unlockAudio();
    setCurrentScreen('game');
    setTimeout(() => {
      initGame();
      restartLoopRef.current(1);
    }, 50);
  }, [unlockAudio, initGame]);

  const handlePlayAgain = useCallback(() => {
    setCurrentScreen('game');
    setTimeout(() => {
      initGame();
      restartLoopRef.current(1);
    }, 50);
  }, [initGame]);

  const handleHome = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setCurrentScreen('start');
  }, []);

  const handleDifficultyChange = useCallback((diff) => {
    difficultyRef.current = diff;
    setDifficulty(diff);
  }, []);

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas]);

  useEffect(() => {
    let animFrame;
    const animateFood = () => {
      if (gameRunningRef.current && !pausedRef.current) draw();
      animFrame = requestAnimationFrame(animateFood);
    };
    animFrame = requestAnimationFrame(animateFood);
    return () => cancelAnimationFrame(animFrame);
  }, [draw]);

  return {
    currentScreen,
    snake,
    dir,
    nextDir,
    food,
    score,
    level,
    highScore,
    difficulty,
    paused,
    gameRunning,
    elapsed,
    isNewRecord,
    canvasSize,
    activeDirection,
    canvasRef,
    touchStartRef,
    startGame,
    initGame,
    tick,
    endGame,
    togglePause,
    changeDir,
    spawnFood,
    restartLoop,
    playEatSound,
    unlockAudio,
    resizeCanvas,
    handlePlayAgain,
    handleHome,
    handleDifficultyChange,
  };
}
