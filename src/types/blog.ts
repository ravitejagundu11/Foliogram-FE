export interface BlogComment {
  id: string
  postId: string
  author: string
  authorName: string
  content: string
  timestamp: number
  replies: BlogReply[]
}

export interface BlogReply {
  id: string
  commentId: string
  author: string
  authorName: string
  content: string
  timestamp: number
}

export interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  authorName: string
  authorRole: 'user' | 'admin' | 'recruiter'
  taggedUsers: string[]
  images: string[]
  videos: string[]
  likes: string[]
  comments: BlogComment[]
  published: boolean
  timestamp: number
  shares: number
}

export interface CreatePostData {
  title: string
  content: string
  taggedUsers: string[]
  images: string[]
  videos: string[]
}
