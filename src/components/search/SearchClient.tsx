'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Profile } from '@/types'
import ProfileCard from './ProfileCard'

interface Props {
  categories: Category[]
}

export default function SearchClient({ categories }: Props) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  const search = useCallback(async () => {
    setLoading(true)
    setSearched(true)
    let q = supabase
      .from('profiles')
      .select('*, profile_categories(category_id, categories(*))')
      .eq('is_approved', true)
      .order('full_name')

    if (query.trim()) {
      q = q.or(
        `full_name.ilike.%${query}%,profession.ilike.%${query}%,description.ilike.%${query}%,help_offer.ilike.%${query}%`
      )
    }

    const { data } = await q.limit(30)
    let profiles = (data as Profile[]) || []

    if (selectedCategory) {
      profiles = profiles.filter((p) =>
        p.categories?.some((c: Category) => String(c.id) === selectedCategory)
      )
    }

    setResults(profiles)
    setLoading(false)
  }, [query, selectedCategory, supabase])

  useEffect(() => {
    search()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search()
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='חפש: "עורך דין", "אינסטלטור", "מורה"...'
              className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-navy-800 text-white rounded-xl font-medium hover:bg-navy-700 transition-colors text-sm"
          >
            חפש
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Star size={14} className="text-gold-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
          >
            <option value="">כל הקטגוריות</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-16 text-slate-400">מחפש...</div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-2">לא נמצאו תוצאות</p>
          <p className="text-slate-400 text-sm">נסה לחפש במילים אחרות או</p>
          <a href="/feed" className="text-navy-700 text-sm font-medium hover:underline">פרסם שאלה לקהילה ←</a>
        </div>
      ) : (
        <div>
          {results.length > 0 && (
            <p className="text-slate-500 text-sm mb-4">נמצאו {results.length} חברי קהילה</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
