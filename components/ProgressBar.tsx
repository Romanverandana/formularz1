'use client';
import styles from './ProgressBar.module.css';

interface Props {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round((currentStep / totalSteps) * 100)));
  return (
    <div className={styles.wrap} aria-label={`Krok ${currentStep} z ${totalSteps}`}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.caption}>{currentStep}/{totalSteps}</span>
    </div>
  );
}