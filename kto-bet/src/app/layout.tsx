import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Bet Autorizada | Casa de Aposta Online | KTO',
  description: 'Faça uma aposta na KTO Bet! Promoções exclusivas, saque instantâneo e as melhores odds!',
  canonical: 'https://www.kto.bet.br/',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.kto.bet.br/',
    siteName: 'KTO Bet',
    title: 'KTO Bet - Casa de Aposta Online',
    description: 'Promoções exclusivas, saque instantâneo e as melhores odds!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KTO Bet - Casa de Aposta Online',
    description: 'Promoções exclusivas, saque instantâneo e as melhores odds!',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md">
          Pular para o conteúdo principal
        </a>
        {children}
      </body>
    </html>
  );
}
