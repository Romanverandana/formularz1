// /lib/kg/neo4j.ts
import neo4j, { Driver } from 'neo4j-driver';

let driver: Driver;

function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
    );
  }
  // Graceful shutdown
  process.on('SIGINT', async () => { await driver?.close(); process.exit(0); });
  process.on('SIGTERM', async () => { await driver?.close(); process.exit(0); });
  return driver;
}

export async function runQuery(query: string, params: Record<string, any> = {}) {
  const session = getDriver().session();
  try {
    return await session.run(query, params);
  } finally {
    await session.close();
  }
}