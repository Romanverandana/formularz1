// lib/schema.ts

import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];

const fileSchema = z.instanceof(File)
  .refine(file => file.size <= MAX_FILE_SIZE, `Maksymalny rozmiar pliku to 5 MB.`)
  .refine(file => ACCEPTED_FILE_TYPES.includes(file.type), "Niewspierany format pliku.");

export const formSchema = z.object({
  selectedType: z.string({ required_error: "Proszę wybrać typ konstrukcji" }).min(1, "Proszę wybrać typ konstrukcji"),
  plannedDate: z.string().optional(),
  comment: z.string().optional(),
  files: z.array(fileSchema).optional(),
  name: z.string().min(2, "Imię i nazwisko jest wymagane"),
  email: z.string().email("Nieprawidłowy format adresu email"),
  phone: z.string().min(9, "Nieprawidłowy numer telefonu"),
  postal: z.string().regex(/^\d{2}-\d{3}$/, "Format kodu pocztowego to 00-000"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Zgoda jest wymagana" }),
  }),
});

export type FormValues = z.infer<typeof formSchema>;