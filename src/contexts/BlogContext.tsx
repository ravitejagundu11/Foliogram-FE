import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { BlogPost, BlogComment, BlogReply, CreatePostData } from '../types/blog'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'

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
  const { addNotification } = useNotification()

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

    // Send notifications to tagged users
    data.taggedUsers.forEach((taggedUsername) => {
      if (taggedUsername !== user.username) {
        addNotification({
          type: 'mention',
          recipientUsername: taggedUsername,
          actorUsername: user.username,
          actorName: `${user.firstName} ${user.lastName}`,
          postId: newPost.id,
          postTitle: newPost.title,
          message: 'mentioned you in a post',
        })
      }
    })

    return newPost.id
  }

  const deletePost = (postId: string) => {
    const updatedPosts = posts.filter((post) => post.id !== postId)
    savePosts(updatedPosts)
  }

  const likePost = (postId: string) => {
    if (!user) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const isLiking = !post.likes.includes(user.username)

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

    // Send notification if liking and not own post
    if (isLiking && post.author !== user.username) {
      addNotification({
        type: 'like',
        recipientUsername: post.author,
        actorUsername: user.username,
        actorName: `${user.firstName} ${user.lastName}`,
        postId: post.id,
        postTitle: post.title,
        message: 'liked your post',
      })
    }
  }

  const sharePost = (postId: string) => {
    if (!user) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 }
      }
      return post
    })
    savePosts(updatedPosts)

    // Send notification if not own post
    if (post.author !== user.username) {
      addNotification({
        type: 'share',
        recipientUsername: post.author,
        actorUsername: user.username,
        actorName: `${user.firstName} ${user.lastName}`,
        postId: post.id,
        postTitle: post.title,
        message: 'shared your post',
      })
    }
  }

  const addComment = (postId: string, content: string) => {
    if (!user) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

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

    // Send notification if not own post
    if (post.author !== user.username) {
      addNotification({
        type: 'comment',
        recipientUsername: post.author,
        actorUsername: user.username,
        actorName: `${user.firstName} ${user.lastName}`,
        postId: post.id,
        postTitle: post.title,
        message: 'commented on your post',
      })
    }
  }

  const addReply = (postId: string, commentId: string, content: string) => {
    if (!user) return

    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const comment = post.comments.find((c) => c.id === commentId)
    if (!comment) return

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

    // Send notification to comment author if not replying to own comment
    if (comment.author !== user.username) {
      addNotification({
        type: 'reply',
        recipientUsername: comment.author,
        actorUsername: user.username,
        actorName: `${user.firstName} ${user.lastName}`,
        postId: post.id,
        postTitle: post.title,
        commentId: comment.id,
        message: 'replied to your comment',
      })
    }
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
