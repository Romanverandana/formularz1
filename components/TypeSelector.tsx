// components/TypeSelector.tsx

import React, { useState, useEffect } from 'react'; // NAPRAWIONO: Dodano import useState i useEffect
import Image from 'next/image';
import styles from './TypeSelector.module.css';
import clsx from 'clsx';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'; // Dodano useReducedMotion

interface Tile {
  value: string;
  title: string;
  desc: string;
  src: string;
  alt: string;
  srcNight?: string;
  altNight?: string;
}

interface TypeSelectorProps {
  tiles: Tile[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const tileVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const descriptionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const TypeSelector: React.FC<TypeSelectorProps> = ({ tiles, selectedValue, onSelect, error }) => {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [focusedTile, setFocusedTile] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Efekt do focusowania na wybranym elemencie po zmianie
  useEffect(() => {
    const selectedElement = document.querySelector(`[data-value="${selectedValue}"]`) as HTMLElement;
    if (selectedElement) {
      selectedElement.focus();
    }
  }, [selectedValue]);

  const showDetails = (tileValue: string) => {
    return hoveredTile === tileValue || focusedTile === tileValue || selectedValue === tileValue;
  };

  return (
    <div>
      <motion.div
        className={styles.container}
        // POPRAWKA A11y: Dodano role i label dla grupy
        role="radiogroup"
        aria-label="Wybierz typ konstrukcji"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tiles.map((tile, index) => (
          <motion.div
            key={tile.value}
            data-value={tile.value} // Do focusowania
            className={clsx(styles.tile, selectedValue === tile.value && styles.selected)}
            onClick={() => onSelect(tile.value)}
            // POPRAWKA A11y: Poprawna obsługa klawiatury
            role="radio"
            aria-checked={selectedValue === tile.value}
            tabIndex={selectedValue === tile.value || (selectedValue === '' && index === 0) ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(tile.value);
              if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
                const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
                const nextIndex = (index + dir + tiles.length) % tiles.length;
                onSelect(tiles[nextIndex].value);
              }
            }}
            variants={tileVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredTile(tile.value)}
            onHoverEnd={() => setHoveredTile(null)}
            onFocus={() => setFocusedTile(tile.value)} // Pokazuje opis na focus
            onBlur={() => setFocusedTile(null)}
          >
            {/* POPRAWKA WYDAJNOŚCI: Struktura nakładki zamiast zamiany węzłów */}
            <div className={styles.imageContainer}>
              {/* Obrazek dzienny zawsze w tle */}
              <motion.div
                className={styles.image}
                animate={prefersReducedMotion ? {} : { scale: 1.05, y: -2, transition: { duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}}
              >
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  // POPRAWKA WYDAJNOŚCI: priority tylko dla pierwszych widocznych obrazków
                  priority={index < 3}
                />
              </motion.div>
              
              {/* Obrazek nocny jako nakładka z animowaną przezroczystością */}
              {tile.srcNight && (
                <motion.div
                  className={styles.imageOverlay}
                  initial={false}
                  animate={{ opacity: showDetails(tile.value) ? 1 : 0 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Image
                    src={tile.srcNight}
                    alt={tile.altNight || tile.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    loading="lazy" // Leniwe ładowanie dla obrazków nocnych
                  />
                </motion.div>
              )}
            </div>

            <div className={styles.content}>
              <h3 className={styles.title}>{tile.title}</h3>
              <div className={styles.description}>
                <AnimatePresence>
                  {showDetails(tile.value) && (
                    <motion.p
                      key="animated-desc"
                      variants={descriptionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {tile.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default TypeSelector;