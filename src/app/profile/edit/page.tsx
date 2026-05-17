'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera } from 'lucide-react'
import type { Category } from '@/types'

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    profession: '',
    help_offer: '',
    help_seek: '',
    is_volunteer: false,
    whatsapp_link: '',
    linkedin_url: '',
    facebook_url: '',
    description: '',
    avatar_url: '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: profile }, { data: cats }, { data: profCats }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('categories').select('*').order('name'),
        supabase.from('profile_categories').select('category_id').eq('profile_id', user.id),
      ])

      if (profile) {
        setForm({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          profession: profile.profession || '',
          help_offer: profile.help_offer || '',
          help_seek: profile.help_seek || '',
          is_volunteer: profile.is_volunteer || false,
          whatsapp_link: profile.whatsapp_link || '',
          linkedin_url: profile.linkedin_url || '',
          facebook_url: profile.facebook_url || '',
          description: profile.description || '',
          avatar_url: profile.avatar_url || '',
        })
      }
      if (cats) setCategories(cats)
      if (profCats) setSelectedCategories(profCats.map((c: { category_id: number }) => c.category_id))
      setLoading(false)
    }
    load()
  }, [])

  const update = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const addNewCategory = async () => {
    if (!newCatName.trim()) return
    setAddingCat(true)
    const slug = newCatName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCatName.trim(), icon: '✨', slug })
      .select()
      .single()
    if (!error && data) {
      setCategories(prev => [...prev, data as Category])
      setSelectedCategories(prev => [...prev, (data as Category).id])
      setNewCatName('')
      setShowNewCat(false)
    }
    setAddingCat(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    let avatar_url = form.avatar_url
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
        avatar_url = publicUrl
      }
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ ...form, avatar_url })
      .eq('id', user.id)

    if (profileError) { setError('שגיאה בשמירה. נסה שוב.'); setSaving(false); return }

    await supabase.from('profile_categories').delete().eq('profile_id', user.id)
    if (selectedCategories.length > 0) {
      await supabase.from('profile_categories').insert(
        selectedCategories.map(id => ({ profile_id: user.id, category_id: id }))
      )
    }

    setSuccess(true)
    setTimeout(() => router.push('/profile/me'), 1200)
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1"

  if (loading) return <div className="text-center py-16 text-slate-400">טוען...</div>

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-bold text-navy-900 mb-6">עריכת פרופיל</h1>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-1 mb-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden bg-navy-800 flex items-center justify-center text-white text-3xl font-bold cursor-pointer hover:opacity-90 transition-opacity group"
            >
              {avatarPreview || form.avatar_url ? (
                <img src={avatarPreview || form.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                form.full_name.charAt(0) || '?'
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </button>
            <p className="text-xs text-slate-400">לחץ לשינוי תמונה</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                setAvatarFile(file)
                setAvatarPreview(URL.createObjectURL(file))
              }}
            />
          </div>

          <div>
            <label className={labelClass}>שם מלא *</label>
            <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
              required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>טלפון</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
              className={inputClass} dir="ltr" />
          </div>

          <div>
            <label className={labelClass}>מקצוע / תפקיד</label>
            <input type="text" value={form.profession} onChange={e => update('profession', e.target.value)}
              placeholder="עורך דין, מורה, אינסטלטור..." className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>קטגוריות</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map(c => (
                <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategories.includes(c.id)
                      ? 'bg-navy-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            {showNewCat ? (
              <div className="flex gap-2">
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="שם הקטגוריה החדשה"
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-600" />
                <button type="button" onClick={addNewCategory} disabled={addingCat || !newCatName.trim()}
                  className="px-3 py-1.5 bg-navy-800 text-white rounded-lg text-sm disabled:opacity-50">
                  {addingCat ? '...' : 'הוסף'}
                </button>
                <button type="button" onClick={() => setShowNewCat(false)}
                  className="px-2 text-slate-400 hover:text-slate-600">✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowNewCat(true)}
                className="text-sm text-navy-700 hover:underline">
                + הוסף קטגוריה חדשה
              </button>
            )}
          </div>

          <div>
            <label className={labelClass}>במה אני יכול לעזור לקהילה?</label>
            <textarea value={form.help_offer} onChange={e => update('help_offer', e.target.value)}
              rows={3} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>מה אני מחפש?</label>
            <textarea value={form.help_seek} onChange={e => update('help_seek', e.target.value)}
              rows={2} className={`${inputClass} resize-none`} />
          </div>

          <hr className="border-slate-100" />

          <div>
            <label className={labelClass}>לינק וואטסאפ</label>
            <input type="url" value={form.whatsapp_link} onChange={e => update('whatsapp_link', e.target.value)}
              placeholder="https://wa.me/972..." className={inputClass} dir="ltr" />
          </div>

          <div>
            <label className={labelClass}>LinkedIn</label>
            <input type="url" value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/..." className={inputClass} dir="ltr" />
          </div>

          <div>
            <label className={labelClass}>Facebook</label>
            <input type="url" value={form.facebook_url} onChange={e => update('facebook_url', e.target.value)}
              placeholder="https://facebook.com/..." className={inputClass} dir="ltr" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="volunteer" checked={form.is_volunteer}
              onChange={e => update('is_volunteer', e.target.checked)}
              className="w-4 h-4 accent-navy-800" />
            <label htmlFor="volunteer" className="text-sm text-slate-700 cursor-pointer">
              אני מתנדב/ת בקהילה
            </label>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">✓ הפרופיל עודכן בהצלחה!</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.push('/profile/me')}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              ביטול
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors disabled:opacity-60">
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
