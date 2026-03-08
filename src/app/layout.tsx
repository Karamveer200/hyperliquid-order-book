import { Public_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

const publicSans = Public_Sans({
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

        {/* Used for SEO and schema.org */}

        {/* TODO: Add company name and domain */}
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

      <body className={`antialiased ${publicSans.className} bg-sys-black-900`}>
        <AppRouterCacheProvider>
          <QueryProvider>{children}</QueryProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
