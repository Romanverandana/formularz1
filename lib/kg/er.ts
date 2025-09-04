import { IngestPayload } from './schemas';
import { runQuery } from './neo4j';
import { hashEmail, normalizePhoneNumber } from './utils';

// Ta funkcja została zaktualizowana, aby używać nowej, "płaskiej" struktury danych
export async function resolveAndIngestEntities(payload: IngestPayload) {
  // Destrukturyzujemy dane zgodnie z nowym, płaskim schematem z schemas.ts
  const { id, ts, name, email, phone, postalCode, productId, plannedDate, consent } = payload;
  
  const emailHash = hashEmail(email);
  const telNorm = phone ? normalizePhoneNumber(phone) : null;

  const cypher = `
    MERGE (p:Person {emailHash: $emailHash})
    ON CREATE SET p.name = $name, p.email = $email, p.tel = $telNorm
    ON MATCH SET p.name = $name, p.email = $email, p.tel = $telNorm

    MERGE (l:Location {postalCode: $postalCode})

    CREATE (s:Submission {
      id: $id,
      ts: datetime($ts),
      productId: $productId,
      plannedDate: CASE WHEN $plannedDate IS NOT NULL THEN date($plannedDate) ELSE null END,
      consent: $consent
    })

    CREATE (p)-[:MADE]->(s)
    CREATE (s)-[:FOR_LOCATION]->(l)
  `;

  await runQuery(cypher, {
    emailHash,
    name,
    email,
    telNorm,
    postalCode,
    id,
    ts,
    productId,
    // Przekazujemy datę jako string lub null
    plannedDate: plannedDate instanceof Date ? plannedDate.toISOString().split('T')[0] : null,
    consent
  });

  console.log(`Ingested submission ${id} for ${email}`);
}