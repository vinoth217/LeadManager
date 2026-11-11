import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Leads — Impiger Technologies Management Portal',
  description: 'AI-Powered Lead Routing & Ingestion Portal for Impiger Technologies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fafc] text-slate-900">{children}</body>
    </html>
  );
}
