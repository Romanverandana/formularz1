'use client';
import { useEffect } from 'react';
import styles from './ErrorPopup.module.css';

interface Props {
  message: string;
  onClose: () => void;
}

export default function ErrorPopup({ message, onClose }: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-live="assertive">
      <div className={styles.card}>
        <p className={styles.text}>{message}</p>
        <button type="button" className={styles.closeBtn} onClick={onClose}>Zamknij</button>
      </div>
    </div>
  );
}