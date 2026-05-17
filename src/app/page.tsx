export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import SearchClient from '@/components/search/SearchClient'
import type { Category } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="text-center py-8 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">מי מכיר? שוהם והאזור</h1>
        <p className="text-slate-500 text-lg">
          מצא עורך דין, אינסטלטור, מורה — מתוך הקהילה שלך
        </p>
      </div>
      <SearchClient categories={(categories as Category[]) || []} />
    </div>
  )
}
