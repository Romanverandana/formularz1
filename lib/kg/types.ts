// /lib/kg/types.ts
import { z } from 'zod';
import { FormValuesSchema, IngestPayloadSchema } from './schemas';

export type FormValues = z.infer<typeof FormValuesSchema>;
export type IngestPayload = z.infer<typeof IngestPayloadSchema>;