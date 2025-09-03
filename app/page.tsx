// app/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-phone-number-input/style.css";
import styles from "./page.module.css";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, FormValues } from "@/lib/schema"; 

// Import komponentów ze zaktualizowanymi ścieżkami
import FileUploader from "@/components/FileUploader";
import TypeSelector from "@/components/TypeSelector";
import ToastNotification from "@/components/ToastNotification";

const PhoneInput = dynamic(() => import("react-phone-number-input"), { ssr: false });
export interface FileWithProgress { id: string; file: File; progress: number; preview?: string; error?: string; }
const tilesData = [
    { 
      value: "home-extension", 
      title: "Home Extension", 
      desc: "Zaprojektuj przestrzeń, która harmonijnie łączy wnętrze z ogrodem, oferując luksus i funkcjonalność przez cały rok. Poczuj magię letnich wieczorów w otoczeniu natury.", 
      src: "/images/forms/home-extension-day.webp", 
      alt: "Home Extension - widok dzienny",
      srcNight: "/images/forms/home-extension-night.webp", // NOWY OBRAZEK NOCNY
      altNight: "Home Extension - widok nocny, rozświetlony"
    },
    { 
      value: "cieply", 
      title: "Klasyczny ciepły", 
      desc: "Stwórz elegancką oazę spokoju, gdzie słońce wpada przez szklane ściany, a Ty cieszysz się komfortem niezależnie od pogody. Idealne miejsce na relaks i spotkania.", 
      src: "/images/forms/ogrod-klasyczny-day.webp", 
      alt: "Klasyczny ciepły ogród zimowy - widok dzienny",
      srcNight: "/images/forms/ogrod-klasyczny-night.webp", // NOWY OBRAZEK NOCNY
      altNight: "Klasyczny ciepły ogród zimowy - widok nocny, klimatyczny"
    },
    { 
      value: "zimny", 
      title: "Sezonowy zimny", 
      desc: "Idealne rozwiązanie dla tych, którzy pragną przedłużyć sezon tarasowy, cieszyć się świeżym powietrzem i dodatkową przestrzenią przez większość roku. Funkcjonalność w atrakcyjnej cenie.", 
      src: "/images/forms/ogrod-sezonowy-day.webp", 
      alt: "Sezonowy zimny ogród zimowy - widok dzienny",
      srcNight: "/images/forms/ogrod-sezonowy-night.webp", // NOWY OBRAZEK NOCNY
      altNight: "Sezonowy zimny ogród zimowy - widok nocny, nastrojowy"
    },
    { 
      value: "pergola", 
      title: "Pergola Bioclimatic", 
      desc: "Odkryj nowoczesny sposób na kontrolę nad słońcem, wiatrem i deszczem. Pergola Bioclimatic to inteligentne rozwiązanie, które dostosowuje się do Twoich potrzeb, tworząc idealny klimat.", 
      src: "/images/forms/pergola-bioclimatic-day.webp", 
      alt: "Pergola Bioclimatic - widok dzienny",
      srcNight: "/images/forms/pergola-bioclimatic-night.webp", // NOWY OBRAZEK NOCNY
      altNight: "Pergola Bioclimatic - widok nocny, elegancki"
    },
    { 
      value: "zadaszenie", 
      title: "Nie wiem", 
      desc: "Nie masz pewności, które rozwiązanie będzie dla Ciebie najlepsze? Zaufaj naszym ekspertom. Pomożemy Ci podjąć świadomą decyzję i zaprojektować idealną przestrzeń dopasowaną do Twoich marzeń.", 
      src: "/images/forms/help-me.webp", 
      alt: "Znak zapytania - pomoc w wyborze",
      srcNight: "/images/forms/help-me.webp", // Używamy tego samego obrazka, jeśli nie ma dedykowanej wersji nocnej
      altNight: "Znak zapytania - pomoc w wyborze"
    },
];
const contactFields = [
  { id: 'name', label: 'Imię i nazwisko', placeholder: 'Jan Kowalski', type: 'text', autoComplete: 'name' },
  { id: 'email', label: 'Email', placeholder: 'jan@example.com', type: 'email', autoComplete: 'email' },
  { id: 'postal', label: 'Kod pocztowy', placeholder: '00-000', type: 'text', autoComplete: 'postal-code' },
] as const;
const PremiumIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '8px' }}><path d="M12 1.5L15.35 8.6L22.5 12L15.35 15.4L12 22.5L8.65 15.4L1.5 12L8.65 8.6L12 1.5Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);

type StepFields = { 1: (keyof FormValues)[]; 2: (keyof FormValues)[]; 3: (keyof FormValues)[]; };
const stepsFields: StepFields = {
  1: ["selectedType"],
  2: [],
  3: ["name", "email", "phone", "postal", "consent"]
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [notification, setNotification] = useState<{ id: number; type: 'success' | 'error'; message: string } | null>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      name: "", email: "", phone: "", postal: "", selectedType: "",
      plannedDate: "", comment: "", files: [], consent: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger, getValues, setValue, reset } = methods;

  const handleNextStep = async () => {
    const fieldsToValidate = stepsFields[currentStep as keyof StepFields];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
    }
  };
  
  const handlePrevStep = () => setCurrentStep(prev => prev > 1 ? prev - 1 : prev);
  
  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'files') {
        formData.append(key, String(value));
      }
    });
    files.forEach(fileWithProgress => {
      formData.append('files', fileWithProgress.file);
    });
    
    try {
      const response = await fetch('/api/submit', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Wystąpił błąd podczas wysyłania formularza.');
      
      const result = await response.json();
      setNotification({ id: Date.now(), type: "success", message: result.message || "Dziękujemy! Kalkulacja w ciągu 24h." });
      reset();
      setFiles([]);
      setCurrentStep(1);
    } catch (error: any) {
      setNotification({ id: Date.now(), type: "error", message: error.message || "Nie udało się wysłać zapytania." });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.container}>
      {notification && (
        <ToastNotification key={notification.id} type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
      <div className={styles.formWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Twój wymarzony ogród zimowy<br/>zaczyna się tutaj</h1>
          <p className={styles.subtitle}><PremiumIcon/> Premium • Minimalizm • Perfekcja</p>
        </header>
        
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            
            {currentStep === 1 && (
              <section>
                <h2 className={styles.sectionTitle}>Krok 1: Wybierz typ konstrukcji <span className={styles.required}>*</span></h2>
                <TypeSelector tiles={tilesData} selectedValue={getValues("selectedType")} onSelect={value => setValue("selectedType", value, { shouldValidate: true })} error={errors.selectedType?.message}/>
              </section>
            )}

            {currentStep === 2 && (
              <section>
                <h2 className={styles.sectionTitle}>Krok 2: Podaj szczegóły</h2>
                <div className={styles.formGroup} style={{marginBottom: '2.5rem'}}>
                  <label htmlFor="plannedDate" className={styles.label}>Orientacyjna data montażu (opcjonalnie)</label>
                  <label htmlFor="plannedDate" className={styles.inputWithIcon}>
                    <input type="date" id="plannedDate" {...register("plannedDate")} className={styles.input} min={today} />
                    <span className={styles.inputIcon}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
                  </label>
                </div>
                <div className={styles.formGroup} style={{marginBottom: '2.5rem'}}>
                  <label className={styles.label}>Dokumentacja wizualna (opcjonalnie)</label>
                  <p className={styles.sectionDesc} style={{marginTop: '0', maxWidth: '100%'}}>Zdjęcia miejsca montażu pomogą nam przygotować idealną ofertę.</p>
                  <FileUploader files={files} onFilesChange={setFiles} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="comment" className={styles.label}>Dodatkowe informacje (opcjonalnie)</label>
                  <textarea id="comment" {...register("comment")} className={styles.textarea} rows={8} placeholder="Opisz swoją wizję lub podaj kluczowe informacje, np. orientacyjne wymiary..."/>
                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section>
                <h2 className={styles.sectionTitle}>Krok 3: Dane kontaktowe</h2>
                <div className={styles.formGrid}>
                  {contactFields.map(({ id, label, ...rest }) => (
                    <div key={id} className={styles.formGroup}>
                      <label htmlFor={id} className={styles.label}>{label} <span className={styles.required}>*</span></label>
                      <input {...rest} id={id} {...register(id)} className={`${styles.input} ${errors[id] ? styles.inputError : ""}`} />
                      {errors[id] && <span className={styles.error}>{errors[id]?.message}</span>}
                    </div>
                  ))}
                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>Telefon <span className={styles.required}>*</span></label>
                    <PhoneInput id="phone" defaultCountry="PL" value={getValues("phone")} onChange={value => setValue("phone", value || "", { shouldValidate: true })} className={`${styles.phoneInput} ${errors.phone ? styles.inputError : ""}`} />
                    {errors.phone && <span className={styles.error}>{errors.phone.message}</span>}
                  </div>
                </div>
                <div className={styles.formGroup} style={{marginTop: '2.5rem'}}>
                  <label className={styles.checkboxContainer}>
                    <input type="checkbox" {...register("consent")} id="consent" className={styles.checkboxInput} />
                    <span className={styles.checkboxLabel}>Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przygotowania indywidualnej oferty oraz kontaktu telefonicznego.<span className={styles.required}>*</span></span>
                  </label>
                  {errors.consent && <span className={`${styles.error} ${styles.errorLeft}`}>{errors.consent.message}</span>}
                </div>
              </section>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem' }}>
              <button type="button" onClick={handlePrevStep} className={styles.submitButton} style={{ background: '#6B7280', width: 'auto', visibility: currentStep > 1 ? 'visible' : 'hidden' }}>Wstecz</button>
              {currentStep < 3 ? (
                <button type="button" onClick={handleNextStep} className={styles.submitButton} style={{ width: 'auto' }}>Dalej</button>
              ) : (
                <button type="submit" className={styles.submitButton} disabled={isSubmitting} style={{ width: 'auto' }}>{isSubmitting ? "Wysyłanie..." : "Wyślij zapytanie"}</button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}