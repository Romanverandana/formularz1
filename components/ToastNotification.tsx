// components/ToastNotification.tsx
'use client';

import { useEffect, useState } from 'react';
import styles from './ToastNotification.module.css';

interface ToastNotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const SuccessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ErrorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;


export default function ToastNotification({ type, message, onClose }: ToastNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Czas na animację wyjścia
    }, 5000); // Pop-up znika po 5 sekundach

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const Icon = type === 'success' ? <SuccessIcon /> : <ErrorIcon />;
  const typeClass = type === 'success' ? styles.success : styles.error;

  return (
    <div className={`${styles.toast} ${typeClass} ${isExiting ? styles.exit : ''}`}>
      <div className={styles.icon}>{Icon}</div>
      <div className={styles.content}>
        <p className={styles.title}>{type === 'success' ? 'Sukces!' : 'Błąd walidacji'}</p>
        <p className={styles.message}>{message}</p>
      </div>
      <button className={styles.closeButton} onClick={handleClose} aria-label="Zamknij powiadomienie">
        <CloseIcon/>
      </button>
    </div>
  );
}