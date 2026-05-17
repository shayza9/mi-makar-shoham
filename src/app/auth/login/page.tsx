'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('מייל או סיסמה שגויים')
      } else {
        setError('שגיאה בכניסה. נסה שוב.')
      }
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setForgotSent(true)
    setLoading(false)
  }

  if (forgotSent) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">נשלח מייל איפוס</h2>
          <p className="text-slate-500">בדוק את תיבת הדואר שלך ולחץ על הלינק לאיפוס הסיסמה</p>
          <button onClick={() => { setForgotSent(false); setForgotMode(false) }}
            className="mt-4 text-sm text-navy-700 hover:underline">
            חזור לכניסה
          </button>
        </div>
      </div>
    )
  }

  if (forgotMode) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="מכבי שוהם" className="w-16 h-16 object-contain mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-navy-900">שכחתי סיסמה</h1>
          </div>
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">כתובת מייל</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required dir="ltr"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors disabled:opacity-60">
              {loading ? 'שולח...' : 'שלח לינק איפוס'}
            </button>
          </form>
          <button onClick={() => setForgotMode(false)}
            className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700">
            חזור לכניסה
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
            <label className="block text-sm font-medium text-slate-700 mb-1">כתובת מייל</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" required dir="ltr"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm" />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors disabled:opacity-60">
            {loading ? 'נכנס...' : 'כניסה'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={() => setForgotMode(true)}
            className="text-slate-400 hover:text-slate-600">
            שכחתי סיסמה
          </button>
          <Link href="/auth/register" className="text-navy-700 font-medium hover:underline">
            הצטרף עכשיו
          </Link>
        </div>
      </div>
    </div>
  )
}
