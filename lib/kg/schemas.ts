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

// Ta linijka automatycznie tworzy typ TypeScript na podstawie powyższego schematu
export type FormValues = z.infer<typeof FormValuesSchema>;