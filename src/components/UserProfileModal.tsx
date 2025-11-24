import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBlog } from '@contexts/BlogContext'
import { useSubscription } from '@contexts/SubscriptionContext'
import { useAuth } from '@contexts/AuthContext'
import { useUserManagement } from '@contexts/UserManagementContext'
import '../styles/UserProfileModal.css'

interface UserProfileModalProps {
  username: string
  onClose: () => void
}

const UserProfileModal = ({ username, onClose }: UserProfileModalProps) => {
  const navigate = useNavigate()
  const modalRef = useRef<HTMLDivElement>(null)
  const { posts } = useBlog()
  const { subscribe, unsubscribe, isSubscribed, getSubscribers } = useSubscription()
  const { user } = useAuth()
  const { users } = useUserManagement()

  const targetUser = users.find((u) => u.username === username)
  const userPosts = posts.filter((p) => p.author === username)
  const subscribed = isSubscribed(username)
  const subscriberCount = getSubscribers(username).length
  const isOwnProfile = user?.username === username

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSubscribe = () => {
    if (subscribed) {
      unsubscribe(username)
    } else {
      subscribe(username)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!targetUser) {
    return null
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <button onClick={onClose} className="modal-close">
          ✕
        </button>

        <div className="modal-header">
          {targetUser.profileImage ? (
            <img
              src={targetUser.profileImage}
              alt={targetUser.username}
              className="modal-avatar"
            />
          ) : (
            <div className="modal-avatar-placeholder">
              {targetUser.firstName?.charAt(0)}
              {targetUser.lastName?.charAt(0)}
            </div>
          )}
          <div className="modal-user-info">
            <h2 className="modal-username">
              {targetUser.firstName} {targetUser.lastName}
            </h2>
            <p className="modal-email">@{targetUser.username}</p>
            <span className="modal-role-badge">{targetUser.role}</span>
          </div>
        </div>

        <div className="modal-stats">
          <div className="modal-stat">
            <span className="modal-stat-value">{userPosts.length}</span>
            <span className="modal-stat-label">Posts</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-value">{subscriberCount}</span>
            <span className="modal-stat-label">Subscribers</span>
          </div>
        </div>

        {!isOwnProfile && (
          <button
            onClick={handleSubscribe}
            className={`modal-subscribe-btn ${subscribed ? 'subscribed' : ''}`}
          >
            {subscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
        )}

        <div className="modal-posts-section">
          <h3 className="modal-posts-title">Recent Posts</h3>
          {userPosts.length === 0 ? (
            <p className="modal-no-posts">No posts yet</p>
          ) : (
            <div className="modal-posts-list">
              {userPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="modal-post-item"
                  onClick={() => {
                    navigate(`/blog/${post.id}`)
                    onClose()
                  }}
                >
                  <h4 className="modal-post-title">{post.title}</h4>
                  <p className="modal-post-date">{formatDate(post.timestamp)}</p>
                  <div className="modal-post-stats">
                    <span>❤️ {post.likes.length}</span>
                    <span>💬 {post.comments.length}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfileModal
