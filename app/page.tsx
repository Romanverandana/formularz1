// app/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";

import styles from "./page.module.css";

import type {
  FormState,
  FormValues,
  TileData,
  NotificationState,
  FileWithProgress,
  FormErrors,
} from "../lib/types";

import TypeSelector from "../components/TypeSelector";
import FileUploader from "../components/FileUploader";
import Notification from "../components/Notification";

// SSR off dla react-phone-number-input
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false,
});

// ====== DANE KAFELKÓW ======
const tilesData: TileData[] = [
  {
    value: "home-extension",
    title: "Home Extension",
    desc: "Najwyższy standard, płaski dach, pełna integracja",
    src: "/images/forms/home-extension-day.webp",
    alt: "Home Extension",
  },
  {
    value: "cieply",
    title: "Klasyczny ciepły",
    desc: "Eleganckie wykonanie, komfort przez cały rok",
    src: "/images/forms/ogrod-klasyczny-day.webp",
    alt: "Klasyczny ciepły",
  },
  {
    value: "zimny",
    title: "Sezonowy zimny",
    desc: "Ekonomiczne rozwiązanie na cieplejsze miesiące",
    src: "/images/forms/ogrod-sezonowy-day.webp",
    alt: "Sezonowy zimny",
  },
  {
    value: "pergola",
    title: "Pergola Bioclimatic",
    desc: "Nowoczesna ochrona tarasu z ruchomymi lamelami",
    src: "/images/forms/pergola-bioclimatic-day.webp",
    alt: "Pergola Bioclimatic",
  },
  {
    value: "zadaszenie",
    title: "Nie wiem, doradźcie mi",
    desc: "Pomożemy wybrać idealne rozwiązanie",
    src: "/images/forms/help-me.webp",
    alt: "Znak zapytania",
  },
];

// ====== STAN POCZĄTKOWY ======
const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  postal: "",
  selectedType: "",
  plannedDate: "",
  comment: "",
  consent: false,
};

const initialFormState: FormState = {
  values: initialValues,
  errors: {},
};

// ====== WALIDACJA ======
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const postalRegex = /^\d{2}-\d{3}$/;

  if (!values.name.trim()) errors.name = "Imię jest wymagane";

  const email = values.email.trim();
  if (!email) errors.email = "Email jest wymagany";
  else if (!emailRegex.test(email)) errors.email = "Nieprawidłowy format email";

  const phone = values.phone || "";
  if (!phone) errors.phone = "Numer telefonu jest wymagany";
  else if (!isValidPhoneNumber(phone))
    errors.phone = "Wymagany jest poprawny numer telefonu";

  const postal = values.postal.trim();
  if (!postal) errors.postal = "Kod pocztowy jest wymagany";
  else if (!postalRegex.test(postal)) errors.postal = "Użyj formatu 00-000";

  if (!values.selectedType) errors.selectedType = "Wybierz typ konstrukcji";

  if (!values.consent) errors.consent = "Zgoda jest wymagana";

  return errors;
}

export default function Home() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState<FileWithProgress[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const updateFormValue = (field: keyof FormValues, value: unknown) => {
    setFormState((prev) => {
      const newValues: FormValues = { ...prev.values, [field]: value as never };
      const newErrors = validate(newValues);
      return { values: newValues, errors: newErrors };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validate(formState.values);
    setFormState((prev) => ({ ...prev, errors }));
    setTouched({
      name: true,
      email: true,
      phone: true,
      postal: true,
      selectedType: true,
      plannedDate: true,
      comment: true,
      consent: true,
    });

    if (Object.keys(errors).length > 0) {
      setNotification({
        type: "error",
        message: "Proszę sprawdzić formularz i poprawić błędy.",
      });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    // TODO: podepnij realny endpoint (fetch/POST)
    setTimeout(() => {
      setSubmitting(false);
      setNotification({
        type: "success",
        message: "Formularz został wysłany! Skontaktujemy się wkrótce.",
      });
      setFormState({ values: initialValues, errors: {} });
      setSelectedFiles([]);
      setTouched({});
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Otrzymaj darmową wycenę</h1>
          <p className={styles.subtitle}>
            Wypełnij formularz, a nasi specjaliści przygotują dla Ciebie indywidualną ofertę
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Sekcja 1: dane kontaktowe */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Podstawowe informacje</h2>

            <div className={styles.formGrid}>
              {/* Imię */}
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Imię <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  inputMode="text"
                  autoComplete="name"
                  value={formState.values.name}
                  onChange={(e) => updateFormValue("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={`${styles.input} ${
                    touched.name && formState.errors.name ? styles.inputError : ""
                  }`}
                  placeholder="Jan Kowalski"
                  required
                />
                {touched.name && formState.errors.name && (
                  <span className={styles.error}>{formState.errors.name}</span>
                )}
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  inputMode="email"
                  autoComplete="email"
                  value={formState.values.email}
                  onChange={(e) => updateFormValue("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`${styles.input} ${
                    touched.email && formState.errors.email ? styles.inputError : ""
                  }`}
                  placeholder="jan@example.com"
                  required
                />
                {touched.email && formState.errors.email && (
                  <span className={styles.error}>{formState.errors.email}</span>
                )}
              </div>

              {/* Telefon */}
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Telefon <span className={styles.required}>*</span>
                </label>
                <PhoneInput
                  id="phone"
                  defaultCountry="PL"
                  value={formState.values.phone}
                  onChange={(value) => updateFormValue("phone", value || "")}
                  onBlur={() => handleBlur("phone")}
                  className={`${styles.phoneInput} ${
                    touched.phone && formState.errors.phone ? styles.inputError : ""
                  }`}
                />
                {touched.phone && formState.errors.phone && (
                  <span className={styles.error}>{formState.errors.phone}</span>
                )}
              </div>

              {/* Kod pocztowy */}
              <div className={styles.formGroup}>
                <label htmlFor="postal" className={styles.label}>
                  Kod pocztowy <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="postal"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={formState.values.postal}
                  onChange={(e) => updateFormValue("postal", e.target.value)}
                  onBlur={() => handleBlur("postal")}
                  className={`${styles.input} ${
                    touched.postal && formState.errors.postal ? styles.inputError : ""
                  }`}
                  placeholder="00-000"
                  pattern="^\d{2}-\d{3}$"
                  required
                />
                {touched.postal && formState.errors.postal && (
                  <span className={styles.error}>{formState.errors.postal}</span>
                )}
              </div>
            </div>
          </div>

          {/* Sekcja 2: wybór typu */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              Jaki typ konstrukcji Cię interesuje? <span className={styles.required}>*</span>
            </h2>
            <TypeSelector
              tiles={tilesData}
              selectedValue={formState.values.selectedType}
              onSelect={(value) => {
                updateFormValue("selectedType", value);
                handleBlur("selectedType");
              }}
              error={touched.selectedType ? formState.errors.selectedType : undefined}
            />
          </div>

          {/* Sekcja 3: data planowana (opcjonalna) */}
          <div className={styles.formSection}>
            <div className={styles.dateInputGroup}>
              <label htmlFor="plannedDate" className={styles.label}>
                Jaka jest planowana data montażu?
              </label>
              <input
                type="date"
                id="plannedDate"
                value={formState.values.plannedDate || ""}
                onChange={(e) => updateFormValue("plannedDate", e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          {/* Sekcja 4: pliki */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dodaj zdjęcia lub plany</h2>
            <p className={styles.sectionDesc}>
              Opcjonalnie. Pomogą nam lepiej zrozumieć Twoje potrzeby.
            </p>
            <FileUploader files={selectedFiles} onFilesChange={setSelectedFiles} />
          </div>

          {/* Sekcja 5: komentarz */}
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="comment" className={styles.label}>
                Dodatkowe informacje
              </label>
              <textarea
                id="comment"
                value={formState.values.comment || ""}
                onChange={(e) => updateFormValue("comment", e.target.value)}
                className={styles.textarea}
                rows={4}
                placeholder="Opcjonalnie. Opisz swoje oczekiwania..."
              />
            </div>
          </div>

          {/* Sekcja 6: zgody */}
          <div className={styles.formSection}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formState.values.consent}
                onChange={(e) => {
                  updateFormValue("consent", e.target.checked);
                  handleBlur("consent");
                }}
                required
              />
              <span className={styles.checkboxLabel}>
                Wyrażam zgodę na przetwarzanie moich danych osobowych{" "}
                <span className={styles.required}>*</span>
              </span>
            </label>
            {touched.consent && formState.errors.consent && (
              <span className={styles.error}>{formState.errors.consent}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? "Wysyłanie..." : "Wyślij zapytanie"}
          </button>
        </form>

        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
}
