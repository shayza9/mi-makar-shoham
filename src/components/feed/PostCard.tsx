'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Post, PostResponse } from '@/types'

interface Props {
  post: Post
  timeAgo: (d: string) => string
  currentUserId?: string
}

export default function PostCard({ post, timeAgo, currentUserId }: Props) {
  const [showResponses, setShowResponses] = useState(false)
  const [responses, setResponses] = useState<PostResponse[]>([])
  const [replyText, setReplyText] = useState('')
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [posting, setPosting] = useState(false)
  const supabase = createClient()

  const loadResponses = async () => {
    if (showResponses) { setShowResponses(false); return }
    setLoadingReplies(true)
    const { data } = await supabase
      .from('post_responses')
      .select('*, author:profiles(id, full_name, avatar_url, profession)')
      .eq('post_id', post.id)
      .order('created_at')
    setResponses((data as PostResponse[]) || [])
    setShowResponses(true)
    setLoadingReplies(false)
  }

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId || !replyText.trim()) return
    setPosting(true)
    const { data } = await supabase
      .from('post_responses')
      .insert({ post_id: post.id, author_id: currentUserId, content: replyText.trim() })
      .select('*, author:profiles(id, full_name, avatar_url, profession)')
      .single()
    if (data) setResponses((prev) => [...prev, data as PostResponse])
    setReplyText('')
    setPosting(false)
  }

  const responseCount = Array.isArray(post.responses)
    ? (post.responses[0] as unknown as { count: number })?.count ?? 0
    : 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${post.author?.id}`}>
          <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-800 font-bold text-sm flex-shrink-0 overflow-hidden">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt={post.author.full_name} className="w-full h-full object-cover" />
            ) : (
              post.author?.full_name?.charAt(0) ?? '?'
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/profile/${post.author?.id}`} className="font-medium text-slate-900 text-sm hover:text-navy-700">
              {post.author?.full_name}
            </Link>
            {post.author?.profession && (
              <span className="text-slate-400 text-xs">· {post.author.profession}</span>
            )}
            {post.category && (
              <span className="text-xs bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">
                {post.category.icon} {post.category.name}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      <p className="text-slate-800 text-sm mt-3 leading-relaxed whitespace-pre-line">{post.content}</p>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={loadResponses}
          className="flex items-center gap-1.5 text-slate-500 text-sm hover:text-navy-700 transition-colors"
        >
          <MessageSquare size={15} />
          {responseCount > 0 ? `${responseCount} תגובות` : 'הגב'}
          {loadingReplies ? '...' : showResponses ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {showResponses && (
        <div className="mt-3 space-y-3">
          {responses.map((r) => (
            <div key={r.id} className="flex items-start gap-2 pr-2">
              <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-bold text-xs flex-shrink-0">
                {r.author?.full_name?.charAt(0) ?? '?'}
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-slate-700">{r.author?.full_name}</p>
                <p className="text-sm text-slate-800 mt-0.5">{r.content}</p>
              </div>
            </div>
          ))}

          {currentUserId && (
            <form onSubmit={submitReply} className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="כתוב תגובה..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
              <button
                type="submit"
                disabled={posting || !replyText.trim()}
                className="px-3 py-2 bg-navy-800 text-white rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
