// /workers/src/ingest.ts
import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { resolveAndIngestEntities } from '@/lib/kg/er';
import type { IngestPayload } from '@/lib/kg/types';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null
});

const QUEUE_NAME = 'ingest-queue';

console.log(`[WORKER] Starting... Listening on queue: "${QUEUE_NAME}"`);

new Worker<IngestPayload>(
  QUEUE_NAME,
  async job => {
    console.log(`[WORKER] Processing job ${job.id}`);
    try {
      await resolveAndIngestEntities(job.data);
    } catch (error) {
       console.error(`[WORKER] Job ${job.id} failed with error:`, error);
       throw error; // Re-throw error to let BullMQ handle retries
    }
  },
  { connection }
);