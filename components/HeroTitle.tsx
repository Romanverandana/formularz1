'use client';
import styles from './HeroTitle.module.css';

export default function HeroTitle() {
  return (
    <div className={styles.hero}>
      <h1 className={styles.title}>Wycena ogrodu zimowego</h1>
      <p className={styles.subtitle}>Zacznij od wyboru typu i kilku prostych pytań.</p>
    </div>
  );
}