import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'pasteCTL - Share Code Instantly',
  description: 'Share code snippets with syntax highlighting and real-time editing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        inter.variable,
        jetbrainsMono.variable,
        "min-h-screen bg-slate-900 text-slate-100 font-sans antialiased"
      )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}