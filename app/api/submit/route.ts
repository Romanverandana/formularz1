// app/api/submit/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const data: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    const files = formData.getAll('files');

    console.log("Odebrane dane formularza:", data);
    console.log(`Odebrano ${files.length} plików.`);

    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ message: "Dziękujemy! Otrzymaliśmy Twoje zapytanie." }, { status: 200 });

  } catch (error) {
    console.error("Błąd po stronie serwera:", error);
    return NextResponse.json({ message: "Wystąpił błąd podczas przetwarzania zapytania." }, { status: 500 });
  }
}