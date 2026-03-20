import styles from './GameScreen.module.css';

export function GameScreen({ score, level, highScore, canvasSize, canvasRef }) {
  const boardPx = canvasSize.board;

  return (
    <div className={styles.screen}>
      <div className={styles.scoreBar}>
        <span className={styles.label}>SC</span>
        <span className={styles.scoreVal}>{String(score).padStart(6, '0')}</span>
        <span className={styles.spacer} />
        <span className={styles.label}>LV</span>
        <span className={styles.levelVal}>{String(level).padStart(2, '0')}</span>
      </div>

      <div className={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          width={boardPx}
          height={boardPx}
          className={styles.canvas}
        />
      </div>

      <div className={styles.hsBar}>
        <span className={styles.hsLabel}>BEST</span>
        <span className={styles.hsVal}>{String(highScore).padStart(6, '0')}</span>
      </div>
    </div>
  );
}
