// app/layout.tsx

import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ 
  subsets: ["latin", "latin-ext"],
  variable: '--font-montserrat' 
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: "Ogrody Zimowe - Wycena | Verandana",
  description: "Wypełnij formularz i otrzymaj bezpłatną, profesjonalną wycenę swojego wymarzonego ogrodu zimowego lub pergoli w ciągu 24h.",
  openGraph: {
    title: "Ogrody Zimowe - Wycena | Verandana",
    description: "Profesjonalna wycena w 24h. Nowoczesne ogrody zimowe, pergole i zadaszenia tarasów.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${montserrat.variable} ${playfair.variable}`}>{children}</body>
    </html>
  );
}