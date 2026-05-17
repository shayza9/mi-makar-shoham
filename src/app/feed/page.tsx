export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import FeedClient from '@/components/feed/FeedClient'
import type { Post } from '@/types'

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(id, full_name, avatar_url, profession, neighborhood, badges),
      category:categories(id, name, icon),
      responses:post_responses(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <FeedClient
      initialPosts={(posts as Post[]) || []}
      categories={categories || []}
      currentUserId={user?.id}
    />
  )
}
