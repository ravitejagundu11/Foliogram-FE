import { useNavigate } from 'react-router-dom'
import { useNotification } from '@contexts/NotificationContext'
import { useAuth } from '@contexts/AuthContext'
import '../styles/NotificationPanel.css'

interface NotificationPanelProps {
  onClose: () => void
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotification()
  const { user } = useAuth()

  const userNotifications = notifications.filter((n) => n.recipientUsername === user?.username)

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'reply':
        return '↩️'
      case 'share':
        return '🔗'
      case 'subscription':
        return '👤'
      case 'mention':
        return '@'
      default:
        return '🔔'
    }
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.postId) {
      navigate(`/blog/${notification.postId}`)
      onClose()
    }
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteNotification(id)
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3 className="notification-title">Notifications</h3>
        <div className="notification-actions">
          {userNotifications.length > 0 && (
            <>
              <button onClick={markAllAsRead} className="action-link">
                Mark all read
              </button>
              <button onClick={clearAll} className="action-link delete">
                Clear all
              </button>
            </>
          )}
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>
      </div>

      {userNotifications.length > 0 && (
        <div className="view-all-container">
          <button 
            onClick={() => {
              navigate('/notifications')
              onClose()
            }} 
            className="view-all-link"
          >
            View All Notifications →
          </button>
        </div>
      )}

      <div className="notification-list">
        {userNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <p className="empty-text">No notifications yet</p>
            <p className="empty-subtext">When you get notifications, they'll show up here</p>
          </div>
        ) : (
          userNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
              <div className="notification-content">
                <p className="notification-message">
                  <strong>{notification.actorName}</strong> {notification.message}
                </p>
                {notification.postTitle && (
                  <p className="notification-post-title">"{notification.postTitle}"</p>
                )}
                <span className="notification-time">{formatTime(notification.timestamp)}</span>
              </div>
              {!notification.read && <div className="unread-indicator" />}
              <button
                onClick={(e) => handleDelete(e, notification.id)}
                className="delete-notification-btn"
                aria-label="Delete notification"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationPanel
