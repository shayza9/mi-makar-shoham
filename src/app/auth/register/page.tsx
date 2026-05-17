'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Category } from '@/types'

const STEPS = ['פרטים אישיים', 'מה אני מציע', 'סיום']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    profession: '',
    description: '',
    help_offer: '',
    help_seek: '',
    is_volunteer: false,
    whatsapp_link: '',
    linkedin_url: '',
    selectedCategories: [] as number[],
  })

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleCategory = (id: number) => {
    setForm((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(id)
        ? prev.selectedCategories.filter((c) => c !== id)
        : [...prev.selectedCategories, id],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    let user = (await supabase.auth.getUser()).data.user

    if (!user) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('מייל זה כבר רשום. נסה להיכנס.')
        } else {
          setError('שגיאה ביצירת החשבון. נסה שוב.')
        }
        setLoading(false)
        return
      }
      user = data.user
    }

    if (!user) { setError('שגיאה. נסה שוב.'); setLoading(false); return }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: form.full_name,
        phone: form.phone,
        profession: form.profession,
        description: form.description,
        help_offer: form.help_offer,
        help_seek: form.help_seek,
        is_volunteer: form.is_volunteer,
        whatsapp_link: form.whatsapp_link,
        linkedin_url: form.linkedin_url,
      })

    if (profileError) { setError('שגיאה בשמירת הפרופיל. נסה שוב.'); setLoading(false); return }

    if (form.selectedCategories.length > 0) {
      await supabase.from('profile_categories').delete().eq('profile_id', user.id)
      await supabase.from('profile_categories').insert(
        form.selectedCategories.map((id) => ({ profile_id: user.id, category_id: id }))
      )
    }

    router.push('/profile/me?registered=1')
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1"

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="מכבי שוהם" className="w-14 h-14 object-contain mx-auto mb-2" />
          <h1 className="text-xl font-bold text-navy-900">הצטרפות לקהילה</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-navy-800 text-white' :
                'bg-slate-200 text-slate-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i === step ? 'text-navy-800 font-medium' : 'text-slate-400'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-slate-200 hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>כתובת מייל *</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                placeholder="your@email.com" className={inputClass} required dir="ltr" />
            </div>
            <div>
              <label className={labelClass}>סיסמה *</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                placeholder="לפחות 6 תווים" className={inputClass} required minLength={6} />
            </div>
            <div>
              <label className={labelClass}>שם מלא *</label>
              <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)}
                placeholder="ישראל ישראלי" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>טלפון</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                placeholder="050-0000000" className={inputClass} dir="ltr" />
            </div>
            <div>
              <label className={labelClass}>לינק וואטסאפ (אופציונלי)</label>
              <input type="url" value={form.whatsapp_link} onChange={(e) => update('whatsapp_link', e.target.value)}
                placeholder="https://wa.me/972..." className={inputClass} dir="ltr" />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>מקצוע / תפקיד</label>
              <input type="text" value={form.profession} onChange={(e) => update('profession', e.target.value)}
                placeholder='עורך דין, מורה, אינסטלטור...' className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>קטגוריות (בחר עד 3)</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      form.selectedCategories.includes(c.id)
                        ? 'bg-navy-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>במה אני יכול לעזור לקהילה?</label>
              <textarea value={form.help_offer} onChange={(e) => update('help_offer', e.target.value)}
                placeholder="תאר את השירות או העזרה שאתה מציע..."
                rows={3} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>מה אני מחפש?</label>
              <textarea value={form.help_seek} onChange={(e) => update('help_seek', e.target.value)}
                placeholder="מה הייתי שמח לקבל מהקהילה..."
                rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="volunteer" checked={form.is_volunteer}
                onChange={(e) => update('is_volunteer', e.target.checked)}
                className="w-4 h-4 accent-navy-800" />
              <label htmlFor="volunteer" className="text-sm text-slate-700 cursor-pointer">
                אני מתנדב/ת בקהילה
              </label>
            </div>
          </div>
        )}

        {/* Step 3 - Summary */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="bg-navy-50 rounded-xl p-4 text-sm space-y-2">
              <p><span className="font-medium">שם:</span> {form.full_name}</p>
              {form.phone && <p><span className="font-medium">טלפון:</span> {form.phone}</p>}
              {form.profession && <p><span className="font-medium">מקצוע:</span> {form.profession}</p>}
              {form.help_offer && <p><span className="font-medium">מציע:</span> {form.help_offer}</p>}
              {form.is_volunteer && <p className="text-green-600 font-medium">✓ מתנדב/ת</p>}
            </div>
            <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 text-sm text-gold-800">
              <strong>שים לב:</strong> הפרופיל שלך ייכנס לאחר אישור מנהל הקהילה.
              נשלח לך אישור במייל.
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              חזור
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 0) {
                  if (!form.email.trim()) { setError('מייל הוא שדה חובה'); return }
                  if (!form.password || form.password.length < 6) { setError('סיסמה חייבת להכיל לפחות 6 תווים'); return }
                  if (!form.full_name.trim()) { setError('שם מלא הוא שדה חובה'); return }
                }
                setError('')
                setStep(step + 1)
              }}
              className="flex-1 py-2.5 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors text-sm"
            >
              המשך
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 bg-gold-500 text-navy-900 rounded-xl font-bold hover:bg-gold-400 transition-colors disabled:opacity-60"
            >
              {loading ? 'שומר...' : 'הצטרף לקהילה!'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
