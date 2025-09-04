"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-phone-number-input/style.css";
import styles from "./page.module.css";
import { useForm, FormProvider, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValuesSchema, FormValues, IngestPayload } from "@/lib/kg/schemas"; 
import Script from 'next/script';
import { generateFormPageJsonLd } from "@/lib/kg/jsonld";

import FileUploader from "@/components/FileUploader";
import TypeSelector, { Tile } from "@/components/TypeSelector";
import HeroTitle from "@/components/HeroTitle";
import CalendarField from "@/components/CalendarField";
import ProgressBar from "@/components/ProgressBar";
import ErrorPopup from "@/components/ErrorPopup";
import ToastNotification from "@/components/ToastNotification";

const PhoneInput = dynamic(() => import("react-phone-number-input"), { ssr: false });
export interface FileWithProgress { id: string; file: File; progress: number; preview?: string; error?: string; }
const tilesData: Tile[] = [
    { value: "home-extension", title: "Home Extension", desc: "Zaprojektuj przestrzeń, która harmonijnie łączy wnętrze z ogrodem, oferując luksus i funkcjonalność przez cały rok.", src: "/images/forms/home-extension-day.webp", alt: "Home Extension - widok dzienny", srcNight: "/images/forms/home-extension-night.webp", altNight: "Home Extension - widok nocny, rozświetlony" },
    { value: "cieply", title: "Klasyczny ciepły", desc: "Stwórz elegancką oazę spokoju, gdzie słońce wpada przez szklane ściany, a Ty cieszysz się komfortem.", src: "/images/forms/ogrod-klasyczny-day.webp", alt: "Klasyczny ciepły ogród zimowy - widok dzienny", srcNight: "/images/forms/ogrod-klasyczny-night.webp", altNight: "Klasyczny ciepły ogród zimowy - widok nocny, klimatyczny" },
    { value: "zimny", title: "Sezonowy zimny", desc: "Idealne rozwiązanie dla tych, którzy pragną przedłużyć sezon tarasowy i cieszyć się dodatkową przestrzenią.", src: "/images/forms/ogrod-sezonowy-day.webp", alt: "Sezonowy zimny ogród zimowy - widok dzienny", srcNight: "/images/forms/ogrod-sezonowy-night.webp", altNight: "Sezonowy zimny ogród zimowy - widok nocny, nastrojowy" },
    { value: "pergola", title: "Pergola Bioclimatic", desc: "Odkryj nowoczesny sposób na kontrolę nad słońcem, wiatrem i deszczem. Inteligentne rozwiązanie dla Twojego tarasu.", src: "/images/forms/pergola-bioclimatic-day.webp", alt: "Pergola Bioclimatic - widok dzienny", srcNight: "/images/forms/pergola-bioclimatic-night.webp", altNight: "Pergola Bioclimatic - widok nocny, elegancki" },
    { value: "zadaszenie", title: "Nie wiem", desc: "Nie masz pewności? Zaufaj naszym ekspertom, którzy pomogą Ci zaprojektować idealną przestrzeń.", src: "/images/forms/help-me.webp", alt: "Znak zapytania - pomoc w wyborze", srcNight: "/images/forms/help-me.webp", altNight: "Znak zapytania - pomoc w wyborze" },
];
const contactFields = [ { id: 'givenName', label: 'Imię', placeholder: 'Jan' }, { id: 'email', label: 'Email', placeholder: 'jan@example.com' }, ];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormValuesSchema),
    mode: "onBlur",
    defaultValues: { consent: { marketing: false } },
  });
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, trigger, getValues, setValue, reset } = methods;
  
  const jsonLd = generateFormPageJsonLd();

  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 1 ? ['productId'] : [];
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
    }
  };
  const handlePrevStep = () => setCurrentStep(prev => prev > 1 ? prev - 1 : prev);
  
  const onError = (formErrors: FieldErrors<FormValues>) => {
    const firstErrorKey = Object.keys(formErrors)[0] as keyof FormValues | 'person' | 'location' | 'consent';
    const errorMessage = "Proszę uzupełnić lub poprawić wymagane pola.";
    setError(errorMessage);
    
    setTimeout(() => {
        let fieldNameToFocus: string = firstErrorKey;
        if (typeof formErrors[firstErrorKey] === 'object' && formErrors[firstErrorKey] !== null) {
            const nestedKey = Object.keys(formErrors[firstErrorKey]!)[0];
            fieldNameToFocus = `${firstErrorKey}.${nestedKey}`;
        }
        
        const byName = document.querySelector<HTMLElement>(`[name="${fieldNameToFocus}"]`);
        const byId = document.getElementById(fieldNameToFocus.split('.').pop()!);
        const el = byName ?? (byId as HTMLElement | null);

        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus?.({ preventScroll: true });
        }
    }, 100);
  };

  const onSubmit = async (data: FormValues) => {
    const startISO =
      data.timePref?.start instanceof Date
        ? data.timePref.start.toISOString()
        : (data.timePref?.start ?? null);

    const payload: Omit<IngestPayload, 'projectId' | 'ts'> = {
      ...data,
      timePref: { start: startISO },
      consent: { ...data.consent, profiling: data.consent.marketing },
    };
    try {
      const response = await fetch('/api/kg/ingest', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd serwera. Spróbuj ponownie.');
      }
      reset();
      setFiles([]);
      setSuccess("Dziękujemy! Otrzymaliśmy Twoje zapytanie.");
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Script id="jsonld-form" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
        {success && <ToastNotification message={success} type="success" onClose={() => setSuccess(null)} />}
        <div className={styles.formWrapper}>
          <header className={styles.header}> <HeroTitle /> </header>
          <ProgressBar currentStep={currentStep} totalSteps={3} />
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onError)} className={styles.form} noValidate>
              
              {currentStep === 1 && (
                <TypeSelector 
                  tiles={tilesData} 
                  selectedValue={getValues("productId")} 
                  onSelect={v => setValue("productId", v, { shouldValidate: true })} 
                  error={errors.productId?.message} 
                />
              )}
              
              {currentStep === 2 && ( 
                <section>
                  <div className={styles.formGroup} style={{marginBottom: '2.5rem'}}>
                      <Controller name="timePref.start" control={control} render={({ field }) => ( <CalendarField label="Orientacyjna data montażu (opcjonalnie)" value={field.value} onChange={field.onChange} /> )} />
                  </div>
                  <div className={styles.formGroup} style={{marginBottom: '2.5rem'}}>
                    <label className={styles.label}>Dokumentacja wizualna (opcjonalnie)</label>
                    <FileUploader files={files} onFilesChange={setFiles} />
                  </div>
                </section>
              )}

              {currentStep === 3 && ( 
                <section>
                  <h2 className={styles.sectionTitle}>Krok 3: Dane kontaktowe</h2>
                  <div className={styles.formGrid}>
                    {contactFields.map(({ id, label, placeholder }) => (
                      <div key={id} className={styles.formGroup}>
                        <label htmlFor={id} className={styles.label}>{label} <span className={styles.required}>*</span></label>
                        <input id={id} placeholder={placeholder} {...register(`person.${id}` as any)} className={`${styles.input} ${errors.person?.[id as keyof FormValues['person']] ? styles.inputError : ""}`} />
                        {errors.person?.[id as keyof FormValues['person']] && <span className={styles.error} role="alert">{errors.person[id as keyof FormValues['person']]?.message}</span>}
                      </div>
                    ))}
                    <div className={styles.formGroup}>
                      <label htmlFor="phone" className={styles.label}>Telefon</label>
                      <Controller name="person.tel" control={control} render={({ field }) => <PhoneInput id="phone" defaultCountry="PL" {...field} />} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="postalCode" className={styles.label}>Kod pocztowy <span className={styles.required}>*</span></label>
                        <input id="postalCode" placeholder="00-000" {...register('location.postalCode')} className={`${styles.input} ${errors.location?.postalCode ? styles.inputError : ""}`} />
                        {errors.location?.postalCode && <span className={styles.error} role="alert">{errors.location.postalCode.message}</span>}
                      </div>
                  </div>
                  <div className={styles.formGroup} style={{marginTop: '2.5rem'}}>
                    <label className={styles.checkboxContainer}>
                      <input type="checkbox" {...register("consent.marketing")} id="consent" className={styles.checkboxInput} />
                      <span className={styles.checkboxLabel}>Wyrażam zgodę na przetwarzanie moich danych...<span className={styles.required}>*</span></span>
                    </label>
                    {errors.consent?.marketing && <span className={`${styles.error} ${styles.errorLeft}`} role="alert">{errors.consent.marketing.message}</span>}
                  </div>
                </section>
              )}
              
              <div className={styles.navigationButtons}>
                  <button type="button" onClick={handlePrevStep} className={styles.submitButton} style={{ background: '#6B7280', visibility: currentStep > 1 ? 'visible' : 'hidden' }}>Wstecz</button>
                  {currentStep < 3 ? ( <button type="button" onClick={handleNextStep} className={styles.submitButton}>Dalej</button> ) 
                  : ( <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? "Wysyłanie..." : "Wyślij zapytanie"}</button> )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </>
  );
}