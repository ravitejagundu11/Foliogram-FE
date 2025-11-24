import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { BlogPost, BlogComment, BlogReply, CreatePostData } from '../types/blog'
import { useAuth } from './AuthContext'

interface BlogContextType {
  posts: BlogPost[]
  createPost: (data: CreatePostData) => string
  deletePost: (postId: string) => void
  likePost: (postId: string) => void
  sharePost: (postId: string) => void
  addComment: (postId: string, content: string) => void
  addReply: (postId: string, commentId: string, content: string) => void
  deleteComment: (postId: string, commentId: string) => void
  deleteReply: (postId: string, commentId: string, replyId: string) => void
  getPostById: (postId: string) => BlogPost | undefined
}

const BlogContext = createContext<BlogContextType | undefined>(undefined)

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const storedPosts = localStorage.getItem('blogPosts')
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts))
    }
  }, [])

  const savePosts = (updatedPosts: BlogPost[]) => {
    setPosts(updatedPosts)
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts))
  }

  const createPost = (data: CreatePostData): string => {
    if (!user) return ''

    const newPost: BlogPost = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: data.title,
      content: data.content,
      author: user.username,
      authorName: `${user.firstName} ${user.lastName}`,
      authorRole: user.role || 'user',
      taggedUsers: data.taggedUsers,
      images: data.images,
      videos: data.videos,
      likes: [],
      comments: [],
      published: true,
      timestamp: Date.now(),
      shares: 0,
    }

    const updatedPosts = [newPost, ...posts]
    savePosts(updatedPosts)
    return newPost.id
  }

  const deletePost = (postId: string) => {
    const updatedPosts = posts.filter((post) => post.id !== postId)
    savePosts(updatedPosts)
  }

  const likePost = (postId: string) => {
    if (!user) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const likes = post.likes.includes(user.username)
          ? post.likes.filter((u) => u !== user.username)
          : [...post.likes, user.username]
        return { ...post, likes }
      }
      return post
    })
    savePosts(updatedPosts)
  }

  const sharePost = (postId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 }
      }
      return post
    })
    savePosts(updatedPosts)
  }

  const addComment = (postId: string, content: string) => {
    if (!user) return

    const newComment: BlogComment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      postId,
      author: user.username,
      authorName: `${user.firstName} ${user.lastName}`,
      content,
      timestamp: Date.now(),
      replies: [],
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] }
      }
      return post
    })
    savePosts(updatedPosts)
  }

  const addReply = (postId: string, commentId: string, content: string) => {
    if (!user) return

    const newReply: BlogReply = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      commentId,
      author: user.username,
      authorName: `${user.firstName} ${user.lastName}`,
      content,
      timestamp: Date.now(),
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = post.comments.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, replies: [...comment.replies, newReply] }
          }
          return comment
        })
        return { ...post, comments: updatedComments }
      }
      return post
    })
    savePosts(updatedPosts)
  }

  const deleteComment = (postId: string, commentId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter((comment) => comment.id !== commentId),
        }
      }
      return post
    })
    savePosts(updatedPosts)
  }

  const deleteReply = (postId: string, commentId: string, replyId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = post.comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== replyId),
            }
          }
          return comment
        })
        return { ...post, comments: updatedComments }
      }
      return post
    })
    savePosts(updatedPosts)
  }

  const getPostById = (postId: string) => {
    return posts.find((post) => post.id === postId)
  }

  return (
    <BlogContext.Provider
      value={{
        posts,
        createPost,
        deletePost,
        likePost,
        sharePost,
        addComment,
        addReply,
        deleteComment,
        deleteReply,
        getPostById,
      }}
    >
      {children}
    </BlogContext.Provider>
  )
}

export const useBlog = () => {
  const context = useContext(BlogContext)
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider')
  }
  return context
}
