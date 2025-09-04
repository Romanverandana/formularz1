// /lib/kg/er.ts
import { IngestPayload } from './types';
import { hashEmail, normalizePhoneNumber } from './utils';
import { runQuery } from './neo4j';
import { v4 as uuidv4 } from 'uuid';

export async function resolveAndIngestEntities(payload: IngestPayload) {
  const { projectId, ts, person, productId, location, timePref, consent } = payload;
  const emailHash = hashEmail(person.email);
  const telNorm = person.tel ? normalizePhoneNumber(person.tel) : null;

  const params = {
    projectId, ts, emailHash, telNorm,
    givenName: person.givenName,
    productId,
    locality: location?.locality, postalCode: location.postalCode,
    startDate: timePref?.start,
    consentMarketing: consent.marketing, consentProfiling: consent.profiling,
    consentId: uuidv4(),
  };

  const query = `
    MERGE (p:Person {id: $emailHash})
    ON CREATE SET p.createdAt = datetime($ts), p.emailHash = $emailHash
    ON MATCH SET p.lastSeen = datetime($ts)
    WITH p
    
    FOREACH (_ IN CASE WHEN $telNorm IS NOT NULL THEN [1] ELSE [] END |
      MERGE (ph:PhoneNumber {telNorm: $telNorm})
      MERGE (p)-[:HAS_PHONE]->(ph)
    )

    WITH p
    MERGE (proj:Project {id: $projectId})
    ON CREATE SET proj.createdAt = datetime($ts)
    MERGE (p)-[:INITIATED]->(proj)

    MERGE (prod:Product {id: $productId})
    MERGE (proj)-[:HAS_PRODUCT]->(prod)

    WITH proj, p
    WHERE $postalCode IS NOT NULL
    MERGE (addr:Address {postalCode: $postalCode, locality: coalesce($locality, 'unknown')})
    MERGE (proj)-[:AT_LOCATION]->(addr)

    WITH proj, p
    WHERE $startDate IS NOT NULL
    MERGE (tp:TimePref {startDate: datetime($startDate)})
    MERGE (proj)-[:HAS_TIME_PREF]->(tp)

    WITH p
    CREATE (c:Consent {
      id: $consentId,
      marketing: $consentMarketing,
      profiling: $consentProfiling,
      timestamp: datetime($ts),
      status: 'active'
    })
    MERGE (p)-[:GAVE_CONSENT]->(c)
  `;
  await runQuery(query, params);
}