'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setError('הלינק לא תקין או פג תוקף. בקש איפוס חדש.')
        else setReady(true)
      })
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setReady(true)
        else setError('הלינק לא תקין. בקש איפוס חדש.')
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('הסיסמאות לא תואמות'); return }
    if (password.length < 6) { setError('סיסמה חייבת להכיל לפחות 6 תווים'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('שגיאה באיפוס הסיסמה. נסה שוב.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  if (!ready && !error) {
    return <div className="text-center py-8 text-slate-400">מאמת...</div>
  }

  if (error && !ready) {
    return (
      <div>
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>
        <button
          onClick={() => router.push('/auth/login')}
          className="w-full py-3 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors"
        >
          חזור לכניסה
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה חדשה</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="לפחות 6 תווים"
          required
          minLength={6}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">אשר סיסמה</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="הכנס שוב"
          required
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
        />
      </div>
      {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors disabled:opacity-60"
      >
        {loading ? 'שומר...' : 'שמור סיסמה חדשה'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="מכבי שוהם" className="w-16 h-16 object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-navy-900">איפוס סיסמה</h1>
        </div>
        <Suspense fallback={<div className="text-center py-8 text-slate-400">טוען...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
