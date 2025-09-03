"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Step2Location.module.css";

type Props = {
  /** Imię z kroku 1 (do nagłówka typu „Gdzie mieszkasz, Jan?”) */
  name?: string;
  /** Wartość startowa (np. gdy wracasz do kroku 2) */
  initialPostal?: string;
  /** Wywołane po zatwierdzeniu kroku 2 */
  onDone: (data: { postal: string; city?: string }) => void;
  /** Pomiń krok (opcjonalnie) */
  onSkip?: () => void;
  /** Ustaw focus automatycznie po montażu (domyślnie: true) */
  autoFocus?: boolean;
};

// Prosta mapa prefixów kodów → miasta (demo)
const POSTAL_MAP: Record<string, string> = {
  "00-": "Warszawa",
  "40-": "Katowice",
  "44-": "Gliwice",
  "30-": "Kraków",
  "50-": "Wrocław",
  "80-": "Gdańsk",
  "90-": "Łódź",
  "61-": "Poznań",
};

// Maskuje do formatu 00-000
function maskPostal(raw: string) {
  const v = raw.replace(/\D/g, "").slice(0, 5);
  return v.length > 2 ? `${v.slice(0, 2)}-${v.slice(2)}` : v;
}

function detectCity(postal: string): string | undefined {
  return POSTAL_MAP[postal.slice(0, 3)];
}

// Placeholder: „ile słońca” (h/dzień) — bez zewn. API
function estimateSunHours(postal: string): number | null {
  if (!/^\d{2}-\d{3}$/.test(postal)) return null;
  if (postal.startsWith("80-")) return 5.5;
  if (postal.startsWith("44-")) return 4.8;
  if (postal.startsWith("30-")) return 5.2;
  if (postal.startsWith("50-")) return 5.1;
  if (postal.startsWith("90-")) return 4.9;
  if (postal.startsWith("61-")) return 5.0;
  if (postal.startsWith("00-")) return 4.7;
  return 5.0;
}

export default function Step2Location({
  name,
  initialPostal = "",
  onDone,
  onSkip,
  autoFocus = true,
}: Props) {
  const [postal, setPostal] = useState<string>(maskPostal(initialPostal));
  const [city, setCity] = useState<string | undefined>(
    /^\d{2}-\d{3}$/.test(initialPostal) ? detectCity(initialPostal) : undefined
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const postalValid = /^\d{2}-\d{3}$/.test(postal);
  const sun = useMemo(() => estimateSunHours(postal), [postal]);

  // Auto focus po montażu
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Auto-miasto 250 ms po poprawnym kodzie
  useEffect(() => {
    if (!postalValid) return setCity(undefined);
    const t = setTimeout(() => setCity(detectCity(postal)), 250);
    return () => clearTimeout(t);
  }, [postal, postalValid]);

  function next() {
    if (!postalValid) return;
    onDone({ postal, city });
  }

  return (
    <div className={styles.wrap} role="group" aria-label="Lokalizacja">
      <label htmlFor="loc_postal" className={styles.label}>
        Gdzie mieszkasz{ name ? `, ${name}` : ""}?
      </label>

      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          id="loc_postal"
          type="text"
          inputMode="numeric"
          placeholder="00-000"
          className={styles.input}
          value={postal}
          onChange={(e) => setPostal(maskPostal(e.target.value))}
          onKeyDown={(e) => { if (e.key === "Enter" && postalValid) next(); }}
          autoComplete="postal-code"
          aria-invalid={!postalValid}
        />
        {postalValid && (
          <span className={styles.checkmark} aria-hidden>✓</span>
        )}
      </div>

      {/* Info: dostępność montażu */}
      <div className={styles.infoCard} aria-label="Dostępność montażu">
        <div className={styles.infoTitle}>
          Dostępność montażu:
          <span className={styles.infoAccent}>
            {" "}{city ? `${city} i okolice` : "Sprawdzamy..."}
          </span>
        </div>
        <div className={styles.infoText}>
          {city
            ? "Tak — obsługujemy Twój region. Terminy standardowe."
            : "Wpisz kod pocztowy, a pokażemy status Twojego regionu."}
        </div>
        <div className={styles.mapPlaceholder} aria-hidden />
      </div>

      {/* Info: słońce (placeholder) */}
      <div className={styles.infoSplit} aria-label="Warunki słoneczne">
        <div>
          <div className={styles.infoTitle}>Ile słońca w Twojej okolicy?</div>
          <div className={styles.infoText}>
            Szacowane: <b>{sun ?? "–"}{sun ? " h/dzień" : ""}</b>
          </div>
        </div>
        <div className={styles.sunIcon} aria-hidden />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.nextBtn}
          disabled={!postalValid}
          onClick={next}
          aria-disabled={!postalValid}
          title={postalValid ? "Dalej" : "Uzupełnij kod pocztowy"}
        >
          Dalej ↩︎
        </button>

        {onSkip && (
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={onSkip}
            title="Pomiń ten krok"
          >
            Pomiń
          </button>
        )}
      </div>
    </div>
  );
}
