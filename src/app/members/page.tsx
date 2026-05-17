export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import ProfileCard from '@/components/search/ProfileCard'
import type { Profile } from '@/types'

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('profiles')
    .select('*, profile_categories(category_id, categories(*))')
    .eq('is_approved', true)
    .order('full_name')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">חברי הקהילה</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {members?.length ?? 0} חברים רשומים
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(members as Profile[])?.map((m) => (
          <ProfileCard key={m.id} profile={m} />
        ))}
      </div>
    </div>
  )
}
