import styles from './Dpad.module.css';

export function Dpad({ onDir, activeDirection }) {
  return (
    <div className={styles.dpad}>
      {/* Center piece (decorative, no click) */}
      <div className={styles.center} />

      {/* Cross arms – each is a real button */}
      <button
        className={`${styles.btn} ${styles.up} ${activeDirection === 'up' ? styles.active : ''}`}
        onClick={() => onDir('up')}
      >
        <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" /></svg>
      </button>

      <button
        className={`${styles.btn} ${styles.down} ${activeDirection === 'down' ? styles.active : ''}`}
        onClick={() => onDir('down')}
      >
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      <button
        className={`${styles.btn} ${styles.left} ${activeDirection === 'left' ? styles.active : ''}`}
        onClick={() => onDir('left')}
      >
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
      </button>

      <button
        className={`${styles.btn} ${styles.right} ${activeDirection === 'right' ? styles.active : ''}`}
        onClick={() => onDir('right')}
      >
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}
