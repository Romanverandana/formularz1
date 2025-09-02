import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

// Konfiguracja fontu Montserrat dla całej strony
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat", // Nazwa zmiennej CSS
});

// Konfiguracja fontu Playfair Display dla nagłówków
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair", // Nazwa zmiennej CSS
});

export const metadata: Metadata = {
  title: "Formularz Wyceny",
  description: "Wypełnij formularz, aby otrzymać darmową wycenę",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      {/* Łączymy zmienne z fontami i przypisujemy do body */}
      <body className={`${montserrat.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}