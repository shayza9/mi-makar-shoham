import Link from 'next/link'
import { Heart } from 'lucide-react'
import type { Profile } from '@/types'

interface Props {
  profile: Profile
}

export default function ProfileCard({ profile }: Props) {
  return (
    <Link
      href={`/profile/${profile.id}`}
      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-navy-600 hover:shadow-md transition-all block"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-navy-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            profile.full_name.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-navy-900">{profile.full_name}</h3>
            {profile.badges?.includes('מאומת') && (
              <span className="text-xs bg-gold-100 text-gold-600 px-1.5 py-0.5 rounded-full">✓ מאומת</span>
            )}
            {profile.badges?.includes('מתנדב') && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">מתנדב</span>
            )}
          </div>

          {profile.profession && (
            <p className="text-navy-700 font-medium text-sm mt-0.5">{profile.profession}</p>
          )}

          {profile.help_offer && (
            <div className="flex items-center gap-1 mt-1.5">
              <Heart size={11} className="text-gold-500 flex-shrink-0" />
              <p className="text-slate-500 text-xs line-clamp-1">{profile.help_offer}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
