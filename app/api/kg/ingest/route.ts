import { NextResponse } from 'next/server';
import { ingestQueue } from '@/lib/queue';
import { FormValuesSchema } from '@/lib/kg/schemas';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // --- POCZĄTEK TWOJEJ LOGIKI (PRZYKŁAD) ---
    // Odczytanie i walidacja danych przychodzących z formularza
    const body = await request.json();
    const validationResult = FormValuesSchema.safeParse(body);

    // Jeśli walidacja się nie powiedzie, zwróć błąd
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 });
    }
    // --- KONIEC TWOJEJ LOGIKI (PRZYKŁAD) ---


    // ***** POCZĄTEK POPRAWIONEGO FRAGMENTU *****
    // Tworzenie obiektu `ingestPayload` z bezpiecznym dostępem do `consent`.
    // Kopiujemy wszystkie zwalidowane dane, a następnie nadpisujemy obiekt `consent`.
    const ingestPayload = {
      ...validationResult.data,
      id: uuidv4(),
      ts: new Date().toISOString(),
      consent: {
        marketing: validationResult.data.consent?.marketing ?? false,
        // Jeśli masz inne zgody, dodaj je tutaj w ten sam sposób, np.:
        // terms: validationResult.data.consent?.terms ?? false,
        profiling: validationResult.data.consent?.marketing ?? false, // Domyślnie, można rozbudować
      },
    };
    // ***** KONIEC POPRAWIONEGO FRAGMENTU *****


    // --- POCZĄTEK TWOJEJ LOGIKI (PRZYKŁAD) ---
    // Dodanie danych do kolejki BullMQ do dalszego przetwarzania
    await ingestQueue.add('ingest', ingestPayload);
    // --- KONIEC TWOJEJ LOGIKI (PRZYKŁAD) ---


    // Zwrócenie pomyślnej odpowiedzi
    return NextResponse.json({ message: 'Data received', id: ingestPayload.id }, { status: 202 });

  } catch (error) {
    console.error('Błąd w API /api/kg/ingest:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}