export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from '@/components/admin/AdminClient'
import type { Profile } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!adminProfile?.is_admin) redirect('/')

  const { data: pending } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_approved', false)
    .order('created_at')

  const { data: approved } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: contactRequests } = await supabase
    .from('contact_requests')
    .select('*, from:profiles!contact_requests_from_id_fkey(full_name), to:profiles!contact_requests_to_id_fkey(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <AdminClient
      pending={(pending as Profile[]) || []}
      approved={(approved as Profile[]) || []}
      contactRequests={contactRequests || []}
    />
  )
}
