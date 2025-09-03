"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ConversationalForm.module.css";

// ——— Typy i helpers ———
type ContactPref = "whatsapp" | "sms" | "call" | undefined;

export type ConversationalPayload = {
  name: string;
  postal: string;
  city?: string;
  contact: string;               // email lub telefon
  contactType: "email" | "phone" | "unknown";
  contactPref: ContactPref;
  callWhen?: string;             // datetime-local
};

type Props = {
  estimatedSeconds?: number;     // np. 30
  onComplete: (data: ConversationalPayload) => void;
};

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

function maskPostal(raw: string) {
  const v = raw.replace(/\D/g, "").slice(0, 5);
  return v.length > 2 ? `${v.slice(0, 2)}-${v.slice(2)}` : v;
}

function detectCity(postal: string): string | undefined {
  return POSTAL_MAP[postal.slice(0, 3)];
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isPhone(v: string) {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 9; // prosta walidacja PL/międzynarodowa
}
function detectContactType(value: string): "email" | "phone" | "unknown" {
  if (isEmail(value)) return "email";
  if (isPhone(value)) return "phone";
  return "unknown";
}

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

// ——— Komponent ———
export default function ConversationalForm({ estimatedSeconds = 30, onComplete }: Props) {
  // Kroki: 0 = imię, 1 = kod+miasto+map/pogoda, 2 = kontakt+pref+kalendarz
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [postal, setPostal] = useState("");
  const [city, setCity] = useState<string | undefined>(undefined);
  const [contact, setContact] = useState("");
  const [contactPref, setContactPref] = useState<ContactPref>(undefined);
  const [callWhen, setCallWhen] = useState("");

  // Walidacje
  const nameValid = name.trim().length >= 2;
  const postalValid = /^\d{2}-\d{3}$/.test(postal);
  const contactType = detectContactType(contact);
  const contactValid = contactType !== "unknown";

  // Autofocus
  const nameRef = useRef<HTMLInputElement | null>(null);
  const postalRef = useRef<HTMLInputElement | null>(null);
  const contactRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (step === 0) nameRef.current?.focus();
    if (step === 1) postalRef.current?.focus();
    if (step === 2) contactRef.current?.focus();
  }, [step]);

  // Auto-miasto
  useEffect(() => {
    if (!postalValid) return setCity(undefined);
    const t = setTimeout(() => setCity(detectCity(postal)), 200);
    return () => clearTimeout(t);
  }, [postal, postalValid]);

  // Progres + ETA
  const progress = useMemo(() => {
    if (step === 0 && nameValid) return 33;
    if (step === 1 && postalValid) return 66;
    if (step === 2 && contactValid) return 100;
    return [0, 33, 66][step] ?? 0;
  }, [step, nameValid, postalValid, contactValid]);

  const secondsLeft = useMemo(() => {
    const perStep = Math.ceil(estimatedSeconds / 3);
    const remainingSteps = 3 - step - (step === 2 && contactValid ? 1 : 0);
    return Math.max(3, remainingSteps * perStep);
  }, [step, estimatedSeconds, contactValid]);

  // Nawigacja
  function next() {
    if (step === 0 && nameValid) return setStep(1);
    if (step === 1 && postalValid) return setStep(2);
    if (step === 2 && contactValid) {
      onComplete({
        name,
        postal,
        city,
        contact,
        contactType,
        contactPref,
        callWhen: callWhen || undefined,
      });
    }
  }
  function skip() {
    setStep((s) => Math.min(2, s + 1));
  }

  return (
    <div className={styles.formContainer} role="group" aria-label="Szybki formularz konwersacyjny">
      {/* Progress */}
      <div className={styles.progressBarContainer} aria-label="Postęp">
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.timeLeft}>Szacowany czas: {secondsLeft}s pozostało</div>

      {/* KROK 1 */}
      {step === 0 && (
        <div className={styles.step}>
          <label htmlFor="cf_name" className={styles.label}>Jak masz na imię?</label>
          <div className={styles.inputWrapper}>
            <input
              ref={nameRef}
              id="cf_name"
              className={styles.inputBig}
              type="text"
              placeholder="Np. Jan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && nameValid) next(); }}
              autoComplete="name"
              aria-invalid={!nameValid}
            />
            {nameValid && <span className={styles.checkmark} aria-hidden>✓</span>}
          </div>

          <div className={styles.navRow}>
            <button type="button" onClick={next} disabled={!nameValid} className={styles.nextButton}>
              Dalej ↩︎
            </button>
            <button type="button" onClick={skip} className={styles.ghostButton}>
              Pomiń
            </button>
          </div>
        </div>
      )}

      {/* KROK 2 */}
      {step === 1 && (
        <div className={styles.step}>
          <label htmlFor="cf_postal" className={styles.label}>
            Gdzie mieszkasz{ name ? `, ${name}` : ""}?
          </label>
          <div className={styles.inputWrapper}>
            <input
              ref={postalRef}
              id="cf_postal"
              className={styles.input}
              type="text"
              inputMode="numeric"
              placeholder="00-000"
              value={postal}
              onChange={(e) => setPostal(maskPostal(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter" && postalValid) next(); }}
              autoComplete="postal-code"
              aria-invalid={!postalValid}
            />
            {postalValid && <span className={styles.checkmark} aria-hidden>✓</span>}
          </div>

          {/* Pseudo-mapka */}
          <div className={styles.infoCard} aria-label="Dostępność montażu">
            <div className={styles.infoTitle}>
              Dostępność montażu:
              <span className={styles.infoAccent}> {city ? `${city} i okolice` : "Sprawdzamy..."}</span>
            </div>
            <div className={styles.infoText}>
              {city ? "Tak — obsługujemy Twój region. Terminy standardowe." : "Wpisz kod pocztowy, a pokażemy status Twojego regionu."}
            </div>
            <div className={styles.mapPlaceholder} aria-hidden />
          </div>

          {/* Słońce (placeholder) */}
          <div className={styles.infoSplit} aria-label="Warunki słoneczne">
            <div>
              <div className={styles.infoTitle}>Ile słońca w Twojej okolicy?</div>
              <div className={styles.infoText}>
                Szacowane: <b>{estimateSunHours(postal) ?? "–"}{estimateSunHours(postal) ? " h/dzień" : ""}</b>
              </div>
            </div>
            <div className={styles.sunIcon} aria-hidden />
          </div>

          <div className={styles.navRow}>
            <button type="button" onClick={next} disabled={!postalValid} className={styles.nextButton}>
              Dalej ↩︎
            </button>
            <button type="button" onClick={skip} className={styles.ghostButton}>
              Pomiń
            </button>
          </div>
        </div>
      )}

      {/* KROK 3 */}
      {step === 2 && (
        <div className={styles.step}>
          <label htmlFor="cf_contact" className={styles.label}>Jak możemy się skontaktować?</label>

          <div className={styles.inputWrapper}>
            <input
              ref={contactRef}
              id="cf_contact"
              className={styles.input}
              type="text"
              placeholder="np. jan@example.com lub +48 600 000 000"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && contactValid) next(); }}
              aria-invalid={!contactValid}
            />
            {contactValid && <span className={styles.checkmark} aria-hidden>✓</span>}
            <div className={styles.detectRow}>
              Wykryto: <b>{contactType === "email" ? "Email" : contactType === "phone" ? "Telefon" : "—"}</b>
            </div>
          </div>

          {/* Preferencja kanału */}
          <fieldset className={styles.chipsWrap}>
            <legend>Preferowany kanał</legend>
            {(["whatsapp","sms","call"] as const).map(opt => (
              <button
                key={opt}
                type="button"
                className={`${styles.chip} ${contactPref === opt ? styles.chipActive : ""}`}
                onClick={() => setContactPref(opt)}
                aria-pressed={contactPref === opt}
              >
                {opt === "whatsapp" ? "WhatsApp" : opt.toUpperCase()}
              </button>
            ))}
          </fieldset>

          {/* Kiedy zadzwonić */}
          <div className={styles.calendarRow}>
            <label htmlFor="cf_call" className={styles.calendarLabel}>Kiedy możemy zadzwonić? (opcjonalnie)</label>
            <input
              id="cf_call"
              className={styles.calendarInput}
              type="datetime-local"
              value={callWhen}
              onChange={(e) => setCallWhen(e.target.value)}
            />
          </div>

          <div className={styles.navRow}>
            <button type="button" onClick={next} disabled={!contactValid} className={styles.nextButton}>
              Zakończ ↩︎
            </button>
            <button type="button" onClick={skip} className={styles.ghostButton}>
              Pomiń
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
