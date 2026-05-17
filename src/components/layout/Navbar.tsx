'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Users, MessageSquare, User, LogOut, Shield } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import type { Profile } from '@/types'

export default function Navbar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const { createClient } = require('@/lib/supabase/client')
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) setProfile(data)
    })
  }, [])

  const handleLogout = async () => {
    const { createClient } = require('@/lib/supabase/client')
    await createClient().auth.signOut()
    window.location.href = '/'
  }

  const navLink = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'bg-gold-500 text-navy-900'
            : 'text-navy-100 hover:bg-navy-700 hover:text-white'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </Link>
    )
  }

  return (
    <nav className="bg-navy-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="מכבי שוהם" className="w-10 h-10 object-contain" />
          <span className="font-bold text-white hidden sm:inline text-lg">מי מכיר? שוהם והאזור</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLink('/', <Search size={16} />, 'חיפוש')}
          {navLink('/feed', <MessageSquare size={16} />, 'קהילה')}
          {navLink('/members', <Users size={16} />, 'חברים')}

          <div className="flex items-center gap-1 mr-2 border-r border-navy-700 pr-2">
            {profile ? (
              <>
                {profile.is_admin && navLink('/admin', <Shield size={16} />, 'ניהול')}
                {navLink('/profile/me', <User size={16} />, 'הפרופיל שלי')}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-navy-100 hover:bg-navy-700 transition-colors"
                  title="התנתק"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 text-sm font-medium text-navy-100 hover:text-white transition-colors"
                >
                  כניסה
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 text-sm font-bold bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-400 transition-colors"
                >
                  הצטרף
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
