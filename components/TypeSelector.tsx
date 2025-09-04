'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import styles from './TypeSelector.module.css';
import clsx from 'clsx';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ***** TUTAJ JEST JEDYNA POPRAWKA *****
// Dodajemy słowo "export", aby ten interfejs był widoczny w innych plikach.
export interface Tile { value: string; title: string; desc: string; src: string; alt: string; srcNight?: string; altNight?: string; }
interface TypeSelectorProps { tiles: Tile[]; selectedValue: string; onSelect: (value: string) => void; error?: string; }

const EASE_ORGANIC = [0.22, 1, 0.36, 1] as const;
const dayBreathing = {
  scale: [1, 1.02, 1],
  filter: ['brightness(1) saturate(1)', 'brightness(1.05) saturate(1.1)', 'brightness(1) saturate(1)'],
  transition: { duration: 5.4, ease: EASE_ORGANIC, repeat: Infinity, repeatType: 'reverse' },
};
const nightBreathing = {
  scale: [2, 2.05, 2],
  filter: ['brightness(1) saturate(1)', 'brightness(1.15) saturate(1.2)', 'brightness(1) saturate(1)'],
  transition: { duration: 4.6, ease: EASE_ORGANIC, repeat: Infinity, repeatType: 'reverse' },
};

export default function TypeSelector({ tiles, selectedValue, onSelect, error }: TypeSelectorProps) {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [focusedTile, setFocusedTile] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const selectedIndex = useMemo(() => Math.max(0, tiles.findIndex(t => t.value === selectedValue)), [tiles, selectedValue]);

  useEffect(() => {
    const selectedElement = document.querySelector(`[data-value="${selectedValue}"]`) as HTMLElement;
    if (selectedElement) {
      selectedElement.focus();
    }
  }, [selectedValue]);

  const onGroupKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      const nextIndex = (selectedIndex + dir + tiles.length) % tiles.length;
      onSelect(tiles[nextIndex].value);
    }
    if (e.key === 'Home') { e.preventDefault(); onSelect(tiles[0].value); }
    if (e.key === 'End') { e.preventDefault(); onSelect(tiles[tiles.length - 1].value); }
  };

  const onTileMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const maxDeg = 4.5;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * (maxDeg * 2);
    const rx = (0.5 - (e.clientY - r.top) / r.height) * (maxDeg * 2);
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
    el.style.setProperty('--tz', '12px');
  };
  const onTileMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--tz', '0px');
  };

  return (
    <div>
      <motion.section 
        className={styles.container} 
        role="radiogroup" 
        aria-label="Wybierz typ konstrukcji"
        onKeyDown={onGroupKeyDown}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      >
        {tiles.map((tile, index) => {
          const isSelected = selectedValue === tile.value;
          const isActive = hoveredTile === tile.value || isSelected || focusedTile === tile.value;
          
          return (
            <motion.article
              key={tile.value}
              data-value={tile.value}
              className={clsx(styles.tile, isSelected && styles.selected)}
              onClick={() => onSelect(tile.value)}
              onMouseEnter={() => setHoveredTile(tile.value)}
              onMouseLeave={() => setHoveredTile(null)}
              onFocus={() => setFocusedTile(tile.value)}
              onBlur={() => setFocusedTile(null)}
              onMouseMove={onTileMouseMove}
              onMouseOut={onTileMouseLeave}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (selectedValue === '' && index === 0) ? 0 : -1}
              variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: EASE_ORGANIC } } }}
            >
              <div className={styles.imageContainer}>
                <motion.div className={styles.image} animate={!prefersReducedMotion ? dayBreathing : {}}>
                  <Image src={tile.src} alt={tile.alt} fill sizes="(max-width: 768px) 100vw, 33vw" priority={index < 3} style={{ objectFit: 'cover' }}/>
                </motion.div>
                {tile.srcNight && (
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key="night"
                        className={styles.imageOverlay}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={!prefersReducedMotion ? { opacity: 1, ...nightBreathing } : { opacity: 1, scale: 2 }}
                        exit={{ opacity: 0, scale: 1, transition: { duration: 0.5, ease: EASE_ORGANIC } }}
                        transition={{ type: "spring", stiffness: 60, damping: 18, mass: 1.2 }}
                      >
                        <Image src={tile.srcNight} alt={tile.altNight || tile.alt} fill sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" style={{ objectFit: 'cover' }}/>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{tile.title}</h3>
                <div className={styles.description} aria-live="polite">
                  <AnimatePresence>
                    {isActive && (
                      <motion.p key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.4, duration: 0.3 }}>
                        <Typewriter text={tile.desc} />
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>
      {error && <p className={styles.errorText} role="alert">{error}</p>}
      <p id="ts-help" className={styles.srOnly}>Użyj klawiszy strzałek, Home i End, aby zmienić wybór.</p>
    </div>
  );
}

function Typewriter({ text, speed = 0.015 }: { text: string; speed?: number; }) {
  const chars = Array.from(text);
  const container = { hidden: {}, visible: { transition: { staggerChildren: speed } } };
  const child = { hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } };
  return (
    <motion.span style={{ display: 'inline-block' }} variants={container} initial="hidden" animate="visible">
      {chars.map((c, i) => ( <motion.span key={i} variants={child}>{c}</motion.span> ))}
    </motion.span>
  );
}