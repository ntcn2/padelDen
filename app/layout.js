import "./globals.css";

const SITE_DESCRIPTION =
  "Падел объединяет людей и превращает обычную игру в часть твоей жизни. Турниры, тренировки и игровые встречи в Аликанте.";

export const metadata = {
  // Адрес для картинки превью ссылки (opengraph-image.jpg). Когда заработает
  // toppadelalicante.com — заменить на https://www.toppadelalicante.com.
  metadataBase: new URL("https://top-padel-alicante.vercel.app"),
  title: "Top Padel Alicante",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Top Padel Alicante",
    description: SITE_DESCRIPTION,
    siteName: "Top Padel Alicante",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
