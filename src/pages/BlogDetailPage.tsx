import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBlog } from '@contexts/BlogContext'
import { useAuth } from '@contexts/AuthContext'
import UserProfileModal from '@components/UserProfileModal'
import '../styles/BlogDetailPage.css'

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPostById, likePost, sharePost, deletePost, addComment, addReply, deleteComment, deleteReply } = useBlog()
  const { user, hasRole } = useAuth()
  const isAdmin = hasRole(['admin'])

  const [commentText, setCommentText] = useState('')
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [showReplyBox, setShowReplyBox] = useState<{ [key: string]: boolean }>({})
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const post = id ? getPostById(id) : undefined

  if (!post) {
    return (
      <div className="blog-detail-container">
        <div className="error-state">
          <h2>Post not found</h2>
          <button onClick={() => navigate('/blog')} className="btn-back">
            Back to Blog
          </button>
        </div>
      </div>
    )
  }

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

  const isLiked = user ? post.likes.includes(user.username) : false

  const handleLike = () => {
    likePost(post.id)
  }

  const handleShare = () => {
    sharePost(post.id)
    const postUrl = `${window.location.origin}/blog/${post.id}`
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Post link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
  }

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id)
      navigate('/blog')
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      addComment(post.id, commentText.trim())
      setCommentText('')
    }
  }

  const handleAddReply = (commentId: string) => {
    const reply = replyText[commentId]
    if (reply && reply.trim()) {
      addReply(post.id, commentId, reply.trim())
      setReplyText({ ...replyText, [commentId]: '' })
      setShowReplyBox({ ...showReplyBox, [commentId]: false })
    }
  }

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment(post.id, commentId)
    }
  }

  const handleDeleteReply = (commentId: string, replyId: string) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      deleteReply(post.id, commentId, replyId)
    }
  }

  const canDeleteComment = (commentAuthor: string) => {
    return isAdmin || post.author === user?.username || commentAuthor === user?.username
  }

  const canDeletePost = () => {
    return isAdmin || post.author === user?.username
  }

  return (
    <div className="blog-detail-container">
      <button onClick={() => navigate('/blog')} className="btn-back-top">
        ← Back to Blog
      </button>

      <article className="post-detail">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-author clickable" onClick={() => setSelectedUser(post.author)}>
              {post.authorName}
            </span>
            <span className="post-date">{formatDate(post.timestamp)}</span>
            <span className="post-role-badge">{post.authorRole}</span>
          </div>
        </header>

        <div className="post-content-section">
          <p className="post-content">{post.content}</p>
        </div>

        {post.taggedUsers.length > 0 && (
          <div className="post-tagged-users">
            <strong>Tagged:</strong>{' '}
            {post.taggedUsers.map((username) => (
              <span key={username} className="tagged-user">
                @{username}
              </span>
            ))}
          </div>
        )}

        {post.images.length > 0 && (
          <div className="post-media-section">
            <h3>Images</h3>
            <div className="post-images-grid">
              {post.images.map((img, idx) => (
                <img key={idx} src={img} alt={`Image ${idx + 1}`} className="post-image" />
              ))}
            </div>
          </div>
        )}

        {post.videos.length > 0 && (
          <div className="post-media-section">
            <h3>Videos</h3>
            <div className="post-videos-grid">
              {post.videos.map((vid, idx) => (
                <video key={idx} src={vid} controls className="post-video" />
              ))}
            </div>
          </div>
        )}

        <div className="post-actions-bar">
          <button onClick={handleLike} className={`action-button ${isLiked ? 'liked' : ''}`}>
            ❤️ Like ({post.likes.length})
          </button>
          <button onClick={handleShare} className="action-button">
            🔗 Share ({post.shares})
          </button>
          <span className="action-info">💬 {post.comments.length} Comments</span>
          {canDeletePost() && (
            <button onClick={handleDeletePost} className="action-button delete-post-btn">
              🗑️ Delete Post
            </button>
          )}
        </div>
      </article>

      <section className="comments-section">
        <h2 className="comments-title">Comments ({post.comments.length})</h2>

        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="comment-textarea"
            rows={3}
          />
          <button type="submit" className="btn-submit-comment" disabled={!commentText.trim()}>
            Post Comment
          </button>
        </form>

        <div className="comments-list">
          {post.comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author clickable" onClick={() => setSelectedUser(comment.author)}>
                  {comment.authorName}
                </span>
                <span className="comment-date">{formatDate(comment.timestamp)}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
              <div className="comment-actions">
                <button
                  onClick={() => setShowReplyBox({ ...showReplyBox, [comment.id]: !showReplyBox[comment.id] })}
                  className="btn-reply"
                >
                  Reply
                </button>
                {canDeleteComment(comment.author) && (
                  <button onClick={() => handleDeleteComment(comment.id)} className="btn-delete-comment">
                    Delete
                  </button>
                )}
              </div>

              {showReplyBox[comment.id] && (
                <div className="reply-form">
                  <textarea
                    value={replyText[comment.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                    placeholder="Write a reply..."
                    className="reply-textarea"
                    rows={2}
                  />
                  <div className="reply-actions">
                    <button onClick={() => handleAddReply(comment.id)} className="btn-submit-reply">
                      Submit Reply
                    </button>
                    <button
                      onClick={() => setShowReplyBox({ ...showReplyBox, [comment.id]: false })}
                      className="btn-cancel-reply"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {comment.replies.length > 0 && (
                <div className="replies-list">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-header">
                        <span className="reply-author clickable" onClick={() => setSelectedUser(reply.author)}>
                          {reply.authorName}
                        </span>
                        <span className="reply-date">{formatDate(reply.timestamp)}</span>
                      </div>
                      <p className="reply-content">{reply.content}</p>
                      {canDeleteComment(reply.author) && (
                        <button
                          onClick={() => handleDeleteReply(comment.id, reply.id)}
                          className="btn-delete-reply"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedUser && (
        <UserProfileModal username={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  )
}

export default BlogDetailPage
