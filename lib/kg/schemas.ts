// /lib/kg/schemas.ts
import { z } from 'zod';

export const FormValuesSchema = z.object({
  person: z.object({
    givenName: z.string().min(2, "Imię jest wymagane"),
    email: z.string().email("Nieprawidłowy adres email"),
    tel: z.string().optional(),
  }),
  productId: z.enum(['home-extension', 'cieply', 'zimny', 'pergola', 'zadaszenie'], {
    errorMap: () => ({ message: "Proszę wybrać typ konstrukcji" }),
  }),
  location: z.object({
    postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Format kodu pocztowego to 00-000"),
    locality: z.string().optional(),
  }),
  timePref: z.object({
    start: z.date().optional(),
  }).optional(),
  consent: z.object({
    marketing: z.literal(true, { errorMap: () => ({ message: "Zgoda jest wymagana" }) }),
  }),
});

export const IngestPayloadSchema = FormValuesSchema.extend({
  projectId: z.string().uuid(),
  ts: z.string().datetime(),
  consent: FormValuesSchema.shape.consent.extend({
      profiling: z.boolean(),
  })
});