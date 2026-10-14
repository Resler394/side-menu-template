import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Velvet Rose Pâtisserie & Café Lounge',
  description: 'Premium digital café and dessert menu with soft pastel aesthetic, interactive category navigation, DZD currency pricing, QR code generator, and full real-time admin management.',
  openGraph: {
    title: 'Velvet Rose Pâtisserie & Café Lounge',
    description: 'Artisanal confections, specialty coffees, and signature desserts priced in Algerian Dinar (DZD).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velvet Rose Pâtisserie & Café Lounge',
    description: 'Artisanal confections, specialty coffees, and signature desserts priced in Algerian Dinar (DZD).',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFF5F7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="font-sans bg-[#FFF5F7] text-[#2D1820] antialiased selection:bg-rose-200 selection:text-rose-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

