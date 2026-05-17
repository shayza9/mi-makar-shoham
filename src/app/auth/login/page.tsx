'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError('שגיאה בשליחת המייל. נסה שוב.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-gold-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">בדוק את המייל שלך</h2>
          <p className="text-slate-500 mb-1">שלחנו לינק כניסה אל:</p>
          <p className="font-medium text-navy-800 mb-6">{email}</p>
          <p className="text-slate-400 text-sm">לחץ על הלינק במייל כדי להיכנס לאפליקציה</p>
          <button
            onClick={() => setSent(false)}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600"
          >
            שנה כתובת מייל
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="מכבי שוהם" className="w-16 h-16 object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-navy-900">כניסה</h1>
          <p className="text-slate-500 text-sm mt-1">מי מכיר? שוהם</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              כתובת מייל
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'שולח...' : 'שלח לינק כניסה'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          עדיין לא רשום?{' '}
          <Link href="/auth/register" className="text-navy-700 font-medium hover:underline">
            הצטרף עכשיו
          </Link>
        </p>
      </div>
    </div>
  )
}
