'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Users, Clock, Shield, Search } from 'lucide-react'
import type { Profile } from '@/types'

interface ContactReq {
  id: string
  from: { full_name: string }
  to: { full_name: string }
  created_at: string
}

interface Props {
  pending: Profile[]
  approved: Profile[]
  contactRequests: ContactReq[]
}

export default function AdminClient({ pending: initialPending, approved, contactRequests: initialContacts }: Props) {
  const [pending, setPending] = useState(initialPending)
  const [contacts, setContacts] = useState(initialContacts)
  const [tab, setTab] = useState<'pending' | 'members' | 'contacts'>('pending')
  const [membersSearch, setMembersSearch] = useState('')
  const supabase = createClient()

  const approveUser = async (id: string) => {
    await supabase.from('profiles').update({ is_approved: true }).eq('id', id)
    setPending(prev => prev.filter(p => p.id !== id))
  }

  const approveAll = async () => {
    if (!confirm(`לאשר את כל ${pending.length} הממתינים?`)) return
    await Promise.all(pending.map(p => supabase.from('profiles').update({ is_approved: true }).eq('id', p.id)))
    setPending([])
  }

  const rejectUser = async (id: string) => {
    if (!confirm('האם למחוק משתמש זה?')) return
    await supabase.from('profiles').delete().eq('id', id)
    setPending(prev => prev.filter(p => p.id !== id))
  }

  const toggleBadge = async (profile: Profile, badge: string) => {
    const current = profile.badges || []
    const updated = current.includes(badge)
      ? current.filter(b => b !== badge)
      : [...current, badge]
    await supabase.from('profiles').update({ badges: updated }).eq('id', profile.id)
  }

  const approveContact = async (id: string) => {
    await supabase.from('contact_requests').update({ status: 'approved' }).eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const rejectContact = async (id: string) => {
    await supabase.from('contact_requests').update({ status: 'rejected' }).eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const filteredApproved = approved.filter(p =>
    [p.full_name, p.email, p.profession].some(f => f?.toLowerCase().includes(membersSearch.toLowerCase()))
  )

  const tabs = [
    { key: 'pending', label: 'ממתינים לאישור', count: pending.length, icon: <Clock size={15} /> },
    { key: 'members', label: `חברים פעילים (${approved.length})`, count: 0, icon: <Users size={15} /> },
    { key: 'contacts', label: 'בקשות קשר', count: contacts.length, icon: <Shield size={15} /> },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-navy-700" />
        <h1 className="text-2xl font-bold text-navy-900">פאנל ניהול</h1>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-navy-800 text-navy-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle size={36} className="mx-auto mb-2 opacity-40" />
              <p>אין בקשות ממתינות</p>
            </div>
          ) : (
            <>
              {pending.length > 1 && (
                <button
                  onClick={approveAll}
                  className="w-full py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors text-sm"
                >
                  ✓ אשר את כולם ({pending.length})
                </button>
              )}
              {pending.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{p.full_name}</h3>
                      <p className="text-sm text-slate-500">{p.email}</p>
                      {p.phone && <p className="text-sm text-slate-500" dir="ltr">{p.phone}</p>}
                      {p.profession && <p className="text-sm text-navy-700 mt-1">מקצוע: {p.profession}</p>}
                      {p.help_offer && <p className="text-sm text-slate-600 mt-1 line-clamp-2">מציע: {p.help_offer}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => rejectUser(p.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <XCircle size={14} />
                        דחה
                      </button>
                      <button
                        onClick={() => approveUser(p.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        <CheckCircle size={14} />
                        אשר
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'members' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={membersSearch}
              onChange={e => setMembersSearch(e.target.value)}
              placeholder="חפש לפי שם, מייל או מקצוע..."
              className="w-full pr-9 pl-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          {filteredApproved.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{p.full_name}</h3>
                <p className="text-sm text-slate-500">{p.profession || p.email}</p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['מאומת', 'מתנדב', 'בעל עסק'].map(badge => (
                  <button
                    key={badge}
                    onClick={() => toggleBadge(p, badge)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      p.badges?.includes(badge)
                        ? 'bg-gold-500 text-navy-900 border-gold-500'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-gold-400'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filteredApproved.length === 0 && (
            <p className="text-center text-slate-400 py-8">לא נמצאו תוצאות</p>
          )}
        </div>
      )}

      {tab === 'contacts' && (
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">אין בקשות קשר ממתינות</div>
          ) : (
            contacts.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-700 mb-3">
                  <span className="font-medium">{r.from?.full_name}</span>
                  {' '}ביקש/ה פרטי קשר של{' '}
                  <span className="font-medium">{r.to?.full_name}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => rejectContact(r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={14} /> דחה
                  </button>
                  <button
                    onClick={() => approveContact(r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    <CheckCircle size={14} /> אשר
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
