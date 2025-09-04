import { z } from 'zod';

// Definicja schematu walidacji Zod
export const FormValuesSchema = z.object({
  /* TUTAJ WKLEJ SWOJE POLA Z WALIDACJĄ, KTÓRE JUŻ MASZ, NP:

    firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki."),
    email: z.string().email("Nieprawidłowy adres email."),
    phoneNumber: z.string().optional(),
    // ... i tak dalej dla wszystkich Twoich pól
  */
});

// Ta linijka tworzy i EKSPORTUJE typ TypeScript na podstawie powyższego schematu.
// To właśnie jej brak lub brak słowa "export" powodował błąd.
export type FormValues = z.infer<typeof FormValuesSchema>;

// Możesz tu również wyeksportować inne potrzebne typy, jeśli istnieją, np.
// export type IngestPayload = ...