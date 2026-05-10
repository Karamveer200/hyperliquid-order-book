import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/lib/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="notranslate">
      <head>
        <meta name="apple-mobile-web-app-title" content="ClpytAI" />
        <meta name="google" content="notranslate" />

        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '{COMPANY_NAME}',
              alternateName: ['', ''],
              url: 'https://{COMPANY_DOMAIN}',
              logo: 'https://{COMPANY_DOMAIN}/apple-icon.png',
              sameAs: [
                'https://x.com/{COMPANY_NAME}',
                'https://linkedin.com/company/{COMPANY_NAME}',
              ],
            }),
          }}
        />
      </head>

      <body className={`antialiased ${inter.className} bg-sys-black-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
