import { NextRequest, NextResponse } from 'next/server';
// Możesz tu użyć Zod do walidacji po stronie serwera, co jest dobrą praktyką
// import { FormValuesSchema } from '@/lib/kg/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Tutaj możesz dodać walidację serwerową
    // const validationResult = FormValuesSchema.safeParse(body);
    // if (!validationResult.success) {
    //   return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    // }

    // Tutaj Twoja logika (HubSpot/DB/Neo4j)
    console.log("Otrzymano dane w API:", body);

    // Zwróć sukces
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error) {
    console.error('Błąd w API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}