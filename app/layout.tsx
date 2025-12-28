import type { Metadata } from 'next';
import './globals.css';
import { BottomTabs } from '@/components/BottomTabs';
import { Phone, MessageCircle } from 'lucide-react';
import React from 'react';

export const metadata: Metadata = {
  title: 'SAUKI MART',
  description: 'Premium Mobile Commerce & Instant Data App',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

const ContactBar = () => (
  <div className="bg-zinc-900 text-white text-[10px] py-1 px-4 flex justify-between items-center z-50 shrink-0">
     <div className="flex gap-3">
        <a href="tel:+2349024099561" className="flex items-center gap-1 hover:text-zinc-300">
          <Phone className="h-3 w-3" /> 09024099561
        </a>
        <a href="tel:+2349076872520" className="flex items-center gap-1 hover:text-zinc-300">
          <Phone className="h-3 w-3" /> 09076872520
        </a>
     </div>
     <a href="https://wa.me/2349024099561" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-green-400 font-bold">
        <MessageCircle className="h-3 w-3" /> WhatsApp
     </a>
  </div>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="antialiased text-zinc-900 max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
          <ContactBar />
          <main className="flex-1 w-full overflow-y-auto no-scrollbar relative">
            {children}
          </main>
          <BottomTabs />
        </div>
      </body>
    </html>
  );
}