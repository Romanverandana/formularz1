'use client';
import Image from 'next/image';
import styles from './TypeSelector.module.css';
import { TileData } from '../lib/types';

interface TypeSelectorProps {
  tiles: TileData[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
}

export default function TypeSelector({ tiles, selectedValue, onSelect, error }: TypeSelectorProps) {
  return (
    <div>
      {error && <span className={styles.mainError}>{error}</span>}
      {/* Usunięto dodatkowy div, teraz siatka jest bezpośrednio tutaj */}
      <div className={styles.typeSelector}>
        {tiles.map((tile) => (
          <div
            key={tile.value}
            className={`${styles.tileOption} ${selectedValue === tile.value ? styles.selected : ''}`}
            onClick={() => onSelect(tile.value)}
            role="radio"
            aria-checked={selectedValue === tile.value}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(tile.value);
              }
            }}
          >
            <Image
              src={tile.src}
              alt={tile.alt}
              width={180}
              height={110}
              className={styles.tileImage}
              priority={true}
            />
            <div className={styles.tileContent}>
              <h3 className={styles.tileTitle}>{tile.title}</h3>
              <p className={styles.tileDesc}>{tile.desc}</p>
            </div>
            {selectedValue === tile.value && (
              <div className={styles.tileCheckmark}>✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}