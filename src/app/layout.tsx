import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'מי מכיר? שוהם והאזור',
  description: 'מאגר קהילתי לתושבי שוהם והאזור - מצא מומחים ומתנדבים מהשכנים שלך',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-slate-400 text-sm py-8 mt-12 border-t border-slate-200">
          מי מכיר? שוהם והאזור © 2025 • קהילה לקהילה
        </footer>
      </body>
    </html>
  )
}
