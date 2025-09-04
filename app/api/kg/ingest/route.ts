// /app/api/kg/ingest/route.ts
import { NextResponse } from 'next/server';
import { ingestQueue } from '@/lib/queue';
import { FormValuesSchema } from '@/lib/kg/schemas';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = FormValuesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid payload", details: validationResult.error.flatten() }, { status: 400 });
    }
    
    // Uzupełnienie danych po stronie serwera
    const payload = {
      ...validationResult.data,
      projectId: uuidv4(),
      ts: new Date().toISOString(),
      consent: {
        ...validationResult.data.consent,
        profiling: validationResult.data.consent.marketing // Domyślnie, można rozbudować
      }
    };

    await ingestQueue.add('ingest-lead', payload);
    return NextResponse.json({ ok: true }, { status: 202 });

  } catch (error) {
    console.error("Ingest API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}