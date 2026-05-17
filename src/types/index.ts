export interface Profile {
  id: string
  full_name: string
  phone?: string
  email?: string
  neighborhood?: string
  avatar_url?: string
  whatsapp_link?: string
  linkedin_url?: string
  profession?: string
  description?: string
  help_offer?: string
  help_seek?: string
  is_volunteer: boolean
  is_approved: boolean
  is_admin: boolean
  badges: string[]
  created_at: string
  categories?: Category[]
}

export interface Category {
  id: number
  name: string
  icon: string
  slug: string
}

export interface Post {
  id: string
  author_id: string
  content: string
  category_id?: number
  created_at: string
  author?: Profile
  category?: Category
  responses?: PostResponse[]
  response_count?: number
}

export interface PostResponse {
  id: string
  post_id: string
  author_id: string
  content: string
  recommended_profile_id?: string
  created_at: string
  author?: Profile
  recommended_profile?: Profile
}

export interface ContactRequest {
  id: string
  from_id: string
  to_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
