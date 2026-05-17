export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail, Briefcase, Heart, ExternalLink, Edit } from 'lucide-react'
import ContactButton from '@/components/profile/ContactButton'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const actualId = id === 'me'
    ? (await supabase.auth.getUser()).data.user?.id
    : id

  if (!actualId) return notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, profile_categories(category_id, categories(*))')
    .eq('id', actualId)
    .single()

  if (!profile) return notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwn = user?.id === actualId

  const { data: contactRequest } = user && !isOwn
    ? await supabase
        .from('contact_requests')
        .select('status')
        .eq('from_id', user.id)
        .eq('to_id', actualId)
        .single()
    : { data: null }

  const showContactInfo = isOwn || contactRequest?.status === 'approved'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-navy-800 rounded-2xl p-6 mb-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                profile.full_name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.full_name}</h1>
              {profile.profession && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Briefcase size={14} className="text-gold-400" />
                  <p className="text-navy-100">{profile.profession}</p>
                </div>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                {profile.badges?.map((b: string) => (
                  <span key={b} className="text-xs bg-gold-500 text-navy-900 px-2 py-0.5 rounded-full font-medium">{b}</span>
                ))}
                {profile.is_volunteer && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">מתנדב/ת</span>
                )}
              </div>
            </div>
          </div>
          {isOwn && (
            <Link href="/profile/edit" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm">
              <Edit size={14} />
              ערוך
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Help offer */}
        {profile.help_offer && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={16} className="text-gold-500" />
              <h2 className="font-semibold text-slate-900 text-sm">מציע/ה לקהילה</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{profile.help_offer}</p>
          </div>
        )}

        {/* Help seek */}
        {profile.help_seek && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-navy-600 text-base">🔍</span>
              <h2 className="font-semibold text-slate-900 text-sm">מחפש/ת</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{profile.help_seek}</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <h2 className="font-semibold text-slate-900 text-sm mb-3">יצירת קשר</h2>
          {showContactInfo ? (
            <div className="space-y-2">
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-navy-600" />
                  <a href={`tel:${profile.phone}`} className="text-sm text-navy-700 hover:underline" dir="ltr">
                    {profile.phone}
                  </a>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-navy-600" />
                  <a href={`mailto:${profile.email}`} className="text-sm text-navy-700 hover:underline" dir="ltr">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.whatsapp_link && (
                <a href={profile.whatsapp_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-600 hover:underline">
                  <ExternalLink size={14} />
                  WhatsApp
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink size={14} />
                  LinkedIn
                </a>
              )}
            </div>
          ) : (
            <ContactButton
              targetId={actualId}
              currentUserId={user?.id}
              existingStatus={contactRequest?.status}
            />
          )}
        </div>

        {/* Categories */}
        {profile.profile_categories?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <h2 className="font-semibold text-slate-900 text-sm mb-3">תחומים</h2>
            <div className="flex flex-wrap gap-2">
              {profile.profile_categories.map((pc: { category_id: number; categories: { id: number; name: string; icon: string } }) => (
                <span key={pc.category_id} className="text-sm bg-navy-50 text-navy-700 px-3 py-1 rounded-full">
                  {pc.categories?.icon} {pc.categories?.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
