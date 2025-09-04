'use client';
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CalendarField.module.css';

interface Props {
  label?: string;
  value?: Date;
  onChange: (d: Date | undefined) => void;
  placeholder?: string;
}

const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export default function CalendarField({ label = 'Wybierz termin', value, onChange, placeholder = 'Wybierz datę' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.calField} ref={ref}>
      {label && <label className={styles.calLabel}>{label}</label>}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={styles.calInput}
      >
        {value ? format(value, 'dd MMMM yyyy', { locale: pl }) : <span className={styles.calPlaceholder}>{placeholder}</span>}
        <CalendarIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Wybór daty"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={styles.calPopover}
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(d) => { onChange(d); setOpen(false); }}
              locale={pl}
              weekStartsOn={1}
              showOutsideDays
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}