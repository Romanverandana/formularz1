import { z } from 'zod';

export const FormValuesSchema = z.object({
  // --- PRZYKŁADOWE POLA - ZMIEŃ JE ZGODNIE Z TWOIM FORMULARZEM ---
  
  name: z.string().min(2, { message: "Imię musi mieć co najmniej 2 znaki." }),
  email: z.string().email({ message: "Proszę podać poprawny adres email." }),
  phone: z.string().optional(), // Opcjonalny numer telefonu
  message: z.string().min(10, { message: "Wiadomość musi mieć co najmniej 10 znaków." }),
  
  // To jest obiekt zgód, który wspólnie naprawialiśmy
  consent: z.object({
    marketing: z.boolean().optional(),
  }).optional(),
});

// Ten typ jest już poprawnie wyeksportowany
export type FormValues = z.infer<typeof FormValuesSchema>;


// ***** NOWO DODANY FRAGMENT *****
// Typ `IngestPayload` rozszerza `FormValues` o pola,
// które są dodawane po stronie serwera (np. id i timestamp).
export type IngestPayload = FormValues & {
  id: string;
  ts: string;
};