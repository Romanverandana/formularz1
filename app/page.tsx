// app/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import styles from "./page.module.css";
export interface FileWithProgress { id: string; file: File; progress: number; preview?: string; error?: string; }
import type { FormValues, TileData, FormErrors } from "../lib/types";
import FileUploader from "../components/FileUploader";
import TypeSelector from "../components/TypeSelector";
import ToastNotification from "../components/ToastNotification"; // Import nowego komponentu

const PhoneInput = dynamic(() => import("react-phone-number-input"), { ssr: false });

const tilesData: TileData[] = [
    { value: "home-extension", title: "Home Extension", desc: "Najwyższy standard, płaski dach", src: "/images/forms/home-extension-day.webp", alt: "Home Extension" },
    { value: "cieply", title: "Klasyczny ciepły", desc: "Eleganckie wykonanie, całoroczny", src: "/images/forms/ogrod-klasyczny-day.webp", alt: "Klasyczny ciepły" },
    { value: "zimny", title: "Sezonowy zimny", desc: "Ekonomiczne rozwiązanie", src: "/images/forms/ogrod-sezonowy-day.webp", alt: "Sezonowy zimny" },
    { value: "pergola", title: "Pergola Bioclimatic", desc: "Nowoczesna ochrona tarasu", src: "/images/forms/pergola-bioclimatic-day.webp", alt: "Pergola Bioclimatic" },
    { value: "zadaszenie", title: "Nie wiem", desc: "Pomożemy wybrać rozwiązanie", src: "/images/forms/help-me.webp", alt: "Znak zapytania" },
];

const contactFields = [
  { id: 'name', label: 'Imię i nazwisko', placeholder: 'Jan Kowalski', type: 'text', autoComplete: 'name' },
  { id: 'email', label: 'Email', placeholder: 'jan@example.com', type: 'email', autoComplete: 'email' },
  { id: 'postal', label: 'Kod pocztowy', placeholder: '00-000', type: 'text', autoComplete: 'postal-code', pattern: '^\\d{2}-\\d{3}$' },
] as const;

const initialValues: FormValues = { name: "", email: "", phone: "", postal: "", selectedType: "", plannedDate: "", comment: "", consent: false };

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Imię jest wymagane";
  if (!values.email.trim()) errors.email = "Email jest wymagany";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Nieprawidłowy format";
  if (!values.phone || !isValidPhoneNumber(values.phone)) errors.phone = "Nieprawidłowy numer";
  if (!values.postal.trim()) errors.postal = "Kod pocztowy jest wymagany";
  else if (!/^\d{2}-\d{3}$/.test(values.postal)) errors.postal = "Format: 00-000";
  if (!values.selectedType) errors.selectedType = "Wybierz typ konstrukcji";
  if (!values.consent) errors.consent = "Zgoda jest wymagana";
  return errors;
};

const PremiumIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '8px' }}><path d="M12 1.5L15.35 8.6L22.5 12L15.35 15.4L12 22.5L8.65 15.4L1.5 12L8.65 8.6L12 1.5Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);

export default function Home() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ id: number; type: 'success' | 'error'; message: string } | null>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);

  const setFieldValue = (field: keyof FormValues, value: any) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    if (Object.keys(touched).length > 0) { // Waliduj na bieżąco tylko po pierwszej próbie wysłania
      setErrors(validate(newValues));
    }
  };

  const handleBlur = (field: keyof FormValues) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (Object.keys(validationErrors).length > 0) {
      setNotification({ id: Date.now(), type: "error", message: "Proszę uzupełnić wymagane pola." });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setNotification({ id: Date.now(), type: "success", message: "Dziękujemy! Kalkulacja w ciągu 24h." });
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setFiles([]);
    }, 2000);
  };

  const today = new Date().toISOString().split("T")[0];
  
  return (
    <div className={styles.container}>
      {notification && (
        <ToastNotification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className={styles.formWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Twój wymarzony ogród zimowy<br />zaczyna się tutaj</h1>
          <p className={styles.subtitle}><PremiumIcon/> Premium • Minimalizm • Perfekcja</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dane kontaktowe</h2>
            <div className={styles.formGrid}>
              {contactFields.map(({ id, label, ...rest }) => (
                <div key={id} className={styles.formGroup}>
                  <label htmlFor={id} className={styles.label}>{label} <span className={styles.required}>*</span></label>
                  <input {...rest} id={id} value={values[id]} onChange={e => setFieldValue(id, e.target.value)} onBlur={() => handleBlur(id)} className={`${styles.input} ${touched[id] && errors[id] ? styles.inputError : ""}`} required />
                  {touched[id] && errors[id] && <span className={styles.error}>{errors[id]}</span>}
                </div>
              ))}
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>Telefon <span className={styles.required}>*</span></label>
                <PhoneInput id="phone" defaultCountry="PL" value={values.phone} onChange={value => setFieldValue("phone", value || "")} onBlur={() => handleBlur("phone")} className={`${styles.phoneInput} ${touched.phone && errors.phone ? styles.inputError : ""}`} />
                {touched.phone && errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Wybierz typ konstrukcji <span className={styles.required}>*</span></h2>
            <TypeSelector tiles={tilesData} selectedValue={values.selectedType} onSelect={value => { setFieldValue("selectedType", value); handleBlur("selectedType"); }} error={touched.selectedType ? errors.selectedType : undefined} />
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Planowany termin realizacji</h2>
            <div className={styles.dateInputWrapper}>
              <label htmlFor="plannedDate" className={styles.label}>Orientacyjna data montażu (opcjonalnie)</label>
              <label htmlFor="plannedDate" className={styles.inputWithIcon}> {/* Zmienione na label */}
                <input type="date" id="plannedDate" value={values.plannedDate || ""} onChange={e => setFieldValue("plannedDate", e.target.value)} className={styles.input} min={today} />
                <span className={styles.inputIcon}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dokumentacja wizualna</h2>
            <p className={styles.sectionDesc}>Zdjęcia miejsca montażu pomogą nam przygotować idealną ofertę.</p>
            <FileUploader files={files} onFilesChange={setFiles} />
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dodatkowe informacje</h2>
            <textarea id="comment" value={values.comment || ""} onChange={e => setFieldValue("comment", e.target.value)} className={styles.textarea} rows={8} placeholder="Opisz swoją wizję lub podaj kluczowe informacje, np. orientacyjne wymiary ogrodu (długość x szerokość), preferowane materiały, czy specjalne wymagania..." />
          </div>

          <div className={styles.formSection}>
            <label className={styles.checkboxContainer}>
              <input type="checkbox" checked={values.consent} onChange={e => { setFieldValue("consent", e.target.checked); handleBlur("consent"); }} required className={styles.checkboxInput} />
              <span className={styles.checkboxLabel}>Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przygotowania indywidualnej oferty oraz kontaktu telefonicznego.<span className={styles.required}> *</span></span>
            </label>
            {touched.consent && errors.consent && <span className={`${styles.error} ${styles.errorLeft}`}>{errors.consent}</span>}
          </div>

          <button type="submit" className={styles.submitButton} disabled={submitting}>{submitting ? "Wysyłanie..." : "Wyślij zapytanie"}</button>
        </form>
      </div>
    </div>
  );
}