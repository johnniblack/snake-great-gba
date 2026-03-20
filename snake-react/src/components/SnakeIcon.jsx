import styles from './SnakeIcon.module.css';

export function SnakeIcon() {
  return (
    <div className={styles.snakeIcon}>
      <div className={styles.snakeIconInner}>
        <div className={`${styles.sDot} ${styles.head}`}></div>
        <div className={styles.sDot}></div>
        <div className={styles.sDot}></div>
        <div className={`${styles.sDot} ${styles.food}`}></div>
      </div>
    </div>
  );
}
