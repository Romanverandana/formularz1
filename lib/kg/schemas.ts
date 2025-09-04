import { z } from 'zod';

export const FormValuesSchema = z.object({
  // --- UPEWNIJ SIĘ, ŻE TE POLA SĄ ZGODNE Z TWOIM FORMULARZEM ---
  // Dodajemy pole `productId` wymagane w kroku 1
  productId: z.string({
    required_error: "Proszę wybrać typ produktu.",
  }).min(1, "Proszę wybrać typ produktu."),
  
  name: z.string().min(2, { message: "Imię musi mieć co najmniej 2 znaki." }),
  email: z.string().email({ message: "Proszę podać poprawny adres email." }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Wiadomość musi mieć co najmniej 10 znaków." }),
  
  // ***** POCZĄTEK POPRAWKI *****
  // Zmieniamy zgodę na wymaganą
  consent: z.object({
    marketing: z.boolean().refine(val => val === true, {
      message: "Zgoda jest wymagana, aby kontynuować.",
    }),
  }),
  // ***** KONIEC POPRAWKI *****
});

export type FormValues = z.infer<typeof FormValuesSchema>;

export type IngestPayload = FormValues & {
  id: string;
  ts: string;
};