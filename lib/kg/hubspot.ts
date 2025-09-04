import type { IngestPayload } from "@/lib/kg/schemas";

function isEnabled() {
  return process.env.HUBSPOT_SYNC === "true" && !!process.env.HUBSPOT_PRIVATE_APP_TOKEN;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function syncToHubSpot(_payload: IngestPayload): Promise<void> {
  if (!isEnabled()) return;
  // TODO: realna integracja po ustawieniu tokena
}
