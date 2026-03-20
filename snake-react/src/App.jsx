import { useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { Dpad } from './components/Dpad';

const PHONE_WIDTH = 460;
const PHONE_HEIGHT = 820;

function App() {
  const phoneRef = useRef(null);
  const {
    currentScreen,
    snake,
    food,
    dir,
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
  } = useGameState();

  // Scale GBA to fit viewport
  useEffect(() => {
    const phone = phoneRef.current;
    if (!phone) return;
    const scalePhone = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scaleX = vw / PHONE_WIDTH;
      const scaleY = vh / PHONE_HEIGHT;
      const scale = Math.min(scaleX, scaleY, 1);
      phone.style.transform = `scale(${scale})`;
      phone.style.width = PHONE_WIDTH + 'px';
      phone.style.height = PHONE_HEIGHT + 'px';
    };
    scalePhone();
    window.addEventListener('resize', scalePhone);
    return () => window.removeEventListener('resize', scalePhone);
  }, []);

  // Audio unlock
  useEffect(() => {
    const handler = () => unlockAudio();
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [unlockAudio]);

  // Keyboard handling (all screens)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (currentScreen === 'start') { startGame(); return; }
        if (currentScreen === 'gameover') { handlePlayAgain(); return; }
      }
      if ((e.key === 'Escape' || e.key === ' ') && currentScreen === 'game') {
        e.preventDefault();
        togglePause();
        return;
      }
      if (currentScreen !== 'game' || !gameRunning) return;
      const map = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
        W: 'up', S: 'down', A: 'left', D: 'right',
      };
      if (map[e.key]) { e.preventDefault(); changeDir(map[e.key]); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, gameRunning, startGame, handlePlayAgain, togglePause, changeDir]);

  const isGame = currentScreen === 'game';
  const isStart = currentScreen === 'start';
  const isOver = currentScreen === 'gameover';

  return (
    <div className="phone-wrapper">
      <div className="phone" ref={phoneRef}>

        {/* L / R Shoulder Buttons */}
        <div className="gba-shoulder gba-shoulder-l"><span>L</span></div>
        <div className="gba-shoulder gba-shoulder-r"><span>R</span></div>

        {/* Top Bar */}
        <div className="gba-top-bar">
          <div className="gba-power-led" />
          <div className="gba-logo">GAME BOY ADVANCE</div>
          <div className="gba-model">AGB-001</div>
        </div>

        {/* Screen Bezel */}
        <div className="gba-screen-bezel">
          <div className="gba-screen-inner">
            {isStart && (
              <StartScreen
                highScore={highScore}
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
              />
            )}
            {isGame && (
              <GameScreen
                score={score}
                level={level}
                highScore={highScore}
                canvasSize={canvasSize}
                canvasRef={canvasRef}
              />
            )}
            {isOver && (
              <GameOverScreen
                score={score}
                elapsed={elapsed}
                snakeLength={snake.length}
                isNewRecord={isNewRecord}
              />
            )}
          </div>
        </div>

        {/* Speaker holes */}
        <div className="gba-speaker">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="gba-speaker-dot" />
          ))}
        </div>

        {/* Controls */}
        <div className="gba-controls">
          <div className="gba-controls-main">
            {isGame ? (
              <Dpad onDir={changeDir} activeDirection={activeDirection} />
            ) : (
              <div className="gba-dpad-placeholder" />
            )}

            <div className="gba-ab-area">
              <button
                className="gba-btn-b"
                onClick={isOver ? handleHome : undefined}
              >B</button>
              <button
                className="gba-btn-a"
                onClick={isStart ? startGame : isOver ? handlePlayAgain : undefined}
              >A</button>
            </div>
          </div>

          {/* Start / Select */}
          <div className="gba-sys-btns">
            <button
              className="gba-btn-select"
              onClick={isGame ? togglePause : isOver ? handleHome : undefined}
            >SELECT</button>
            <div className="gba-sys-dot" />
            <button
              className="gba-btn-start"
              onClick={isGame ? togglePause : isStart ? startGame : handlePlayAgain}
            >START</button>
          </div>
        </div>

        {/* Pause overlay */}
        {isGame && paused && (
          <div className="gba-pause-overlay">
            <div className="gba-pause-title">- PAUSE -</div>
            <button className="gba-pause-resume" onClick={togglePause}>
              CONTINUE
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
