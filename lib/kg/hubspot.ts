// /lib/kg/hubspot.ts
import { IngestPayload } from './types';

export async function syncToHubSpot(payload: IngestPayload): Promise<void> {
  if (process.env.HUBSPOT_SYNC !== 'true') {
    return;
  }
  // Dalsza logika...
}