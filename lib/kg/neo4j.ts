import { auth, driver as createDriver, type Driver, type Session, type QueryResult, type RecordShape } from 'neo4j-driver';

let neo4jDriver: Driver | null = null;

function getDriver(): Driver {
  if (!neo4jDriver) {
    const uri = process.env.NEO4J_URI as string;
    const user = process.env.NEO4J_USER as string;
    const pass = process.env.NEO4J_PASSWORD as string;
    neo4jDriver = createDriver(uri, auth.basic(user, pass));
  }
  return neo4jDriver;
}

type CypherParams = Record<string, unknown>;

export async function runQuery<T extends RecordShape = RecordShape>(
  cypher: string,
  params: CypherParams = {}
): Promise<QueryResult<T>> {
  const session: Session = getDriver().session();
  try {
    return await session.run(cypher, params);
  } finally {
    await session.close();
  }
}