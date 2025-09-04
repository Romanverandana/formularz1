// /lib/kg/types.ts
import { z } from "zod";
import { FormValuesSchema } from "./schemas";

// Typy wyprowadzone z aktualnego schematu
export type FormValues = z.infer<typeof FormValuesSchema>;

// IngestPayload jest już zdefiniowany i eksportowany w ./schemas
export type { IngestPayload } from "./schemas";
