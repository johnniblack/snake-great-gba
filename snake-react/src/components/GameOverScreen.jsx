import styles from './GameOverScreen.module.css';

export function GameOverScreen({ score, elapsed, snakeLength, isNewRecord }) {
  const mins = Math.floor(elapsed / 60);
  const secs = (elapsed % 60).toString().padStart(2, '0');

  return (
    <div className={styles.screen}>
      <div className={styles.title}>GAME OVER</div>

      {isNewRecord && (
        <div className={styles.newRecord}>★ NEW RECORD! ★</div>
      )}

      <div className={styles.scoreBox}>
        <div className={styles.scoreLabel}>SCORE</div>
        <div className={styles.scoreVal}>{String(score).padStart(6, '0')}</div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>TIME</div>
          <div className={styles.statVal}>{mins}:{secs}</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <div className={styles.statLabel}>LENGTH</div>
          <div className={styles.statVal}>{snakeLength}</div>
        </div>
      </div>

      <div className={styles.hints}>
        <div className={styles.hint}><span className={styles.hintKey}>A</span> RETRY</div>
        <div className={styles.hint}><span className={styles.hintKey}>B</span> HOME</div>
      </div>
    </div>
  );
}
