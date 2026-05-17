'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Clock, Send } from 'lucide-react'

interface Props {
  targetId: string
  currentUserId?: string
  existingStatus?: string
}

export default function ContactButton({ targetId, currentUserId, existingStatus }: Props) {
  const [status, setStatus] = useState(existingStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const requestContact = async () => {
    if (!currentUserId) { router.push('/auth/login'); return }
    setLoading(true)
    await supabase.from('contact_requests').insert({
      from_id: currentUserId,
      to_id: targetId,
    })
    setStatus('pending')
    setLoading(false)
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <Clock size={14} />
        בקשה נשלחה — ממתין לאישור
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <p className="text-sm text-slate-400">בקשת הקשר נדחתה</p>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
        <Lock size={14} />
        פרטי הקשר מוגנים
      </div>
      {currentUserId ? (
        <button
          onClick={requestContact}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-navy-900 rounded-lg font-medium hover:bg-gold-400 transition-colors text-sm disabled:opacity-60"
        >
          <Send size={14} />
          {loading ? 'שולח...' : 'בקש פרטי קשר'}
        </button>
      ) : (
        <button
          onClick={() => router.push('/auth/login')}
          className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-lg text-sm hover:bg-navy-700 transition-colors"
        >
          התחבר כדי לבקש פרטים
        </button>
      )}
    </div>
  )
}
