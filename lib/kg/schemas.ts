import { z } from "zod";

// Ostateczny, płaski schemat formularza – zgodny z Twoją wersją Zod
export const FormValuesSchema = z.object({
  // Krok 1
  productId: z.string().min(1, "Proszę wybrać typ produktu."),

  // Krok 2
  plannedDate: z.date().optional(),

  // Krok 3
  name: z.string().min(2, { message: "Imię musi mieć co najmniej 2 znaki." }),
  email: z.string().email({ message: "Proszę podać poprawny adres email." }),
  phone: z.string().optional(),
  postalCode: z.string().min(5, { message: "Kod pocztowy musi mieć 5 znaków." }),

  // Używamy .refine(), co jest najbardziej uniwersalną i poprawną metodą
  consent: z.boolean().refine((v) => v === true, {
    message: "Zgoda jest wymagana.",
  }),
});

export type FormValues = z.infer<typeof FormValuesSchema>;

export type IngestPayload = FormValues & {
  id: string;
  ts: string;
};

