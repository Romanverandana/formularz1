// /lib/kg/jsonld.ts
const organizationData = {
  "@type": "LocalBusiness",
  "@id": "https://twoja-domena.pl/#organization",
  "name": "Verandana",
  "url": "https://twoja-domena.pl",
  "logo": "https://twoja-domena.pl/logo.png",
  "address": { "@type": "PostalAddress", "streetAddress": "ul. Przykładowa 1", "addressLocality": "Gliwice", "postalCode": "44-100", "addressCountry": "PL" },
  "telephone": "+48123456789",
  "sameAs": [ "https://www.facebook.com/twojprofil", "https://www.instagram.com/twojprofil" ]
};

export function generateFormPageJsonLd() {
  const graph = [
    {
      "@type": "WebSite",
      "@id": "https://twoja-domena.pl/#website",
      "url": "https://twoja-domena.pl",
      "name": "Verandana",
      "publisher": { "@id": "https://twoja-domena.pl/#organization" },
       "potentialAction":{ "@type":"SearchAction", "target":"https://twoja-domena.pl/szukaj?q={search_term_string}", "query-input":"required name=search_term_string" }
    },
    organizationData,
    {
      "@type": "WebPage",
      "@id": "https://twoja-domena.pl/wycena/#webpage",
      "url": "https://twoja-domena.pl/wycena",
      "name": "Bezpłatna Wycena Ogrodu Zimowego | Verandana",
      "isPartOf": { "@id": "https://twoja-domena.pl/#website" },
      "mainEntity": {
        "@type": "Service",
        "name": "Wycena ogrodu zimowego",
        "serviceType": "Estimation",
        "provider": { "@id": "https://twoja-domena.pl/#organization" }
      }
    }
  ];
  return { "@context": "https://schema.org", "@graph": graph };
}