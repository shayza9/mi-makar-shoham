'use client'

import { useState } from 'react'
import Link from 'next/link'

const REGISTER_URL = 'https://mi-makar-shoham.vercel.app/auth/register'

const SHARE_TEXT = `מכיר/ה מישהו שגר/ה בשוהם והאזור? 🏘️
הצטרפו ל"מי מכיר? שוהם והאזור" — הרשת הקהילתית שלנו!

מצא מומחים, מתנדבים ואנשי מקצוע מהשכונה.
הצטרפות חינמית: ${REGISTER_URL}`

export default function InvitePage() {
  const [copied, setCopied] = useState(false)

  const waUrl = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(REGISTER_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <img src="/logo.png" alt="מכבי שוהם" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">הזמן חברים לקהילה!</h1>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          שתף את מי מכיר? עם שכנים, חברים ומשפחה מהאזור.<br />
          יחד בונים קהילה חזקה יותר.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 text-right mb-6 leading-relaxed whitespace-pre-line">
          {SHARE_TEXT}
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>📲</span>
            שלח בוואטסאפ
          </a>
          <button
            onClick={copyLink}
            className="w-full py-3 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            {copied ? '✓ הלינק הועתק!' : '🔗 העתק לינק הצטרפות'}
          </button>
          <Link href="/" className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors">
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}
