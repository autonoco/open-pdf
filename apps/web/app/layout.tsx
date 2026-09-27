import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google';
import './global.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-ui' });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-doc' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-code' });

const title = 'open-pdf — The PDF framework built for agents';
const description =
  'Your coding agent writes documents as React components. You get a live preview that is the actual PDF, click any element to comment, and export PDF or editable Word. MIT.';

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://openpdf.sh'),
  icons: { icon: '/autono.svg' },
  openGraph: {
    title,
    description,
    url: 'https://openpdf.sh',
    siteName: 'open-pdf',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
