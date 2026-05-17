'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, Clock } from 'lucide-react'
import type { Post, Category } from '@/types'
import PostCard from './PostCard'

interface Props {
  initialPosts: Post[]
  categories: Category[]
  currentUserId?: string
}

export default function FeedClient({ initialPosts, categories, currentUserId }: Props) {
  const [posts, setPosts] = useState(initialPosts)
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [posting, setPosting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) { router.push('/auth/login'); return }
    if (!content.trim()) return
    setPosting(true)

    const { data: post } = await supabase
      .from('posts')
      .insert({
        author_id: currentUserId,
        content: content.trim(),
        category_id: selectedCategory ? Number(selectedCategory) : null,
      })
      .select(`*, author:profiles(id, full_name, avatar_url, profession, neighborhood, badges), category:categories(id, name, icon), responses:post_responses(count)`)
      .single()

    if (post) {
      setPosts((prev) => [post as Post, ...prev])
      setContent('')
      setSelectedCategory('')
      setShowForm(false)
    }
    setPosting(false)
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'עכשיו'
    if (mins < 60) return `לפני ${mins} דק'`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `לפני ${hours} שעות`
    const days = Math.floor(hours / 24)
    return `לפני ${days} ימים`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">פיד הקהילה</h1>
          <p className="text-slate-500 text-sm mt-0.5">שאל, המלץ, עזור לשכניך</p>
        </div>
        <button
          onClick={() => {
            if (!currentUserId) { router.push('/auth/login'); return }
            setShowForm(!showForm)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-xl hover:bg-navy-700 transition-colors text-sm font-medium"
        >
          <MessageSquare size={16} />
          שאל את הקהילה
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitPost} className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'מחפש אינסטלטור טוב?\nמישהו מכיר רואה חשבון שמבין עוסקים?\nכתוב כאן...'}
            rows={3}
            className="w-full px-0 py-0 border-0 outline-none resize-none text-sm text-slate-900 placeholder-slate-400"
            autoFocus
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
            >
              <option value="">ללא קטגוריה</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700">
                ביטול
              </button>
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gold-500 text-navy-900 rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {posting ? 'שולח...' : 'פרסם'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>עדיין אין פוסטים</p>
            <p className="text-sm mt-1">היה הראשון לשאול!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} timeAgo={timeAgo} currentUserId={currentUserId} />
          ))
        )}
      </div>
    </div>
  )
}
