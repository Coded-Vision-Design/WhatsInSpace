import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import AnimatedFavicon from '@/components/AnimatedFavicon'

const SITE_URL = 'https://whatsthatin.space'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "What's That In Space? | Artemis Programme",
    template: "%s | What's That In Space?",
  },
  description: "Interactive space education site covering the Artemis programme, the Solar System, the ISS, and the latest space news. Explore 3D models, live data, and more.",
  keywords: ['Artemis', 'NASA', 'space', 'Moon', 'ISS', 'solar system', 'space news', 'space exploration', 'astronomy'],
  authors: [{ name: 'Coded Vision Design', url: 'https://codedvisiondesign.co.uk' }],
  creator: 'Coded Vision Design',
  publisher: 'Coded Vision Design',
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: "What's That In Space?",
    title: "What's That In Space? | Artemis Programme",
    description: "Interactive space education site covering the Artemis programme, the Solar System, the ISS, and the latest space news.",
    images: [
      {
        url: '/images/mission/moon-hero.webp',
        width: 1200,
        height: 630,
        alt: "What's That In Space? - Explore the cosmos",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's That In Space? | Artemis Programme",
    description: "Interactive space education site covering the Artemis programme, the Solar System, the ISS, and the latest space news.",
    images: ['/images/mission/moon-hero.webp'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-8MGJBLHGP7" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-8MGJBLHGP7');`}
        </Script>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: "What's That In Space?",
                  description: 'Interactive space education site covering the Artemis programme, the Solar System, the ISS, and the latest space news.',
                  publisher: { '@id': `${SITE_URL}/#organisation` },
                  inLanguage: 'en-GB',
                },
                {
                  '@type': 'Organisation',
                  '@id': `${SITE_URL}/#organisation`,
                  name: 'Coded Vision Design',
                  url: 'https://codedvisiondesign.co.uk',
                  logo: `${SITE_URL}/icon.svg`,
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased relative">
        {/* Noise Overlay */}
        <div className="pointer-events-none fixed inset-0 z-[999] opacity-[0.05]">
          <svg className="h-full w-full">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
        <AnimatedFavicon />
        {children}
      </body>
    </html>
  )
}
