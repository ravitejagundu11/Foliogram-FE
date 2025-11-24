import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useBlog } from '@contexts/BlogContext'
import { useAuth } from '@contexts/AuthContext'
import UserProfileModal from '@components/UserProfileModal'
import '../styles/BlogListPage.css'

const BlogListPage = () => {
  const navigate = useNavigate()
  const { posts, likePost, sharePost, deletePost } = useBlog()
  const { user, hasRole } = useAuth()
  const isAdmin = hasRole(['admin'])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleLike = (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    likePost(postId)
  }

  const handleShare = (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    sharePost(postId)
    const postUrl = `${window.location.origin}/blog/${postId}`
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Post link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
  }

  const handleDelete = (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost(postId)
    }
  }

  const canDeletePost = (post: any) => {
    return isAdmin || post.author === user?.username
  }

  return (
    <div className="blog-list-container">
      <div className="blog-list-header">
        <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
        <button onClick={() => navigate('/blog/create')} className="btn-create-post">
          Create New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p className="text-gray-500">No posts yet. Be the first to create one!</p>
          <button onClick={() => navigate('/blog/create')} className="btn-create-first">
            Create First Post
          </button>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => {
            const isLiked = user ? post.likes.includes(user.username) : false
            const truncatedContent =
              post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content

            return (
              <Link to={`/blog/${post.id}`} key={post.id} className="post-card">
                {post.images.length > 0 && (
                  <div className="post-card-image">
                    <img src={post.images[0]} alt={post.title} />
                  </div>
                )}

                <div className="post-card-content">
                  <h2 className="post-card-title">{post.title}</h2>

                  <div className="post-card-meta">
                    <span 
                      className="post-author clickable" 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedUser(post.author)
                      }}
                    >
                      {post.authorName}
                    </span>
                    <span className="post-date">{formatDate(post.timestamp)}</span>
                  </div>

                  <p className="post-card-excerpt">{truncatedContent}</p>

                  {post.taggedUsers.length > 0 && (
                    <div className="post-tags">
                      {post.taggedUsers.map((username) => (
                        <span key={username} className="post-tag">
                          @{username}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="post-card-actions">
                    <button
                      onClick={(e) => handleLike(post.id, e)}
                      className={`action-btn ${isLiked ? 'liked' : ''}`}
                    >
                      ❤️ {post.likes.length}
                    </button>
                    <button className="action-btn">💬 {post.comments.length}</button>
                    <button onClick={(e) => handleShare(post.id, e)} className="action-btn">
                      🔗 {post.shares}
                    </button>
                    {canDeletePost(post) && (
                      <button onClick={(e) => handleDelete(post.id, e)} className="action-btn delete-btn">
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {selectedUser && (
        <UserProfileModal username={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  )
}

export default BlogListPage
