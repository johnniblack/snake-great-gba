import styles from './StartScreen.module.css';

export function StartScreen({ highScore, difficulty, onDifficultyChange }) {
  return (
    <div className={styles.screen}>
      <div className={styles.logo}>
        <div className={styles.title}>SNAKE</div>
        <div className={styles.subtitle}>贪  吃  蛇</div>
      </div>

      <div className={styles.hsBox}>
        <div className={styles.hsLabel}>- HIGH SCORE -</div>
        <div className={styles.hsVal}>{String(highScore).padStart(6, '0')}</div>
      </div>

      <div className={styles.pressStart}>PRESS  START</div>

      <div className={styles.diffRow}>
        <button
          className={`${styles.diffBtn} ${difficulty === 'easy' ? styles.active : ''}`}
          onClick={() => onDifficultyChange('easy')}
        >EASY</button>
        <button
          className={`${styles.diffBtn} ${difficulty === 'normal' ? styles.active : ''}`}
          onClick={() => onDifficultyChange('normal')}
        >NORM</button>
        <button
          className={`${styles.diffBtn} ${difficulty === 'hard' ? styles.active : ''}`}
          onClick={() => onDifficultyChange('hard')}
        >HARD</button>
      </div>

      <div className={styles.footer}>© 2025  SNAKE GAME</div>
    </div>
  );
}
