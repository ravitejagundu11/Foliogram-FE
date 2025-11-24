import { useNavigate } from 'react-router-dom'
import { useNotification } from '@contexts/NotificationContext'
import { useAuth } from '@contexts/AuthContext'
import '../styles/NotificationsPage.css'

const NotificationsPage = () => {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotification()
  const { user } = useAuth()

  const userNotifications = notifications.filter((n) => n.recipientUsername === user?.username)
  const unreadNotifications = userNotifications.filter((n) => !n.read)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
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
    }
  }

  const groupedNotifications = {
    today: [] as typeof userNotifications,
    yesterday: [] as typeof userNotifications,
    earlier: [] as typeof userNotifications,
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86400000

  userNotifications.forEach((notification) => {
    if (notification.timestamp >= todayStart) {
      groupedNotifications.today.push(notification)
    } else if (notification.timestamp >= yesterdayStart) {
      groupedNotifications.yesterday.push(notification)
    } else {
      groupedNotifications.earlier.push(notification)
    }
  })

  return (
    <div className="notifications-page-container">
      <div className="notifications-page-header">
        <div>
          <h1 className="notifications-page-title">Notifications</h1>
          {unreadNotifications.length > 0 && (
            <p className="notifications-page-subtitle">
              You have {unreadNotifications.length} unread notification{unreadNotifications.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="notifications-page-actions">
          {userNotifications.length > 0 && (
            <>
              <button onClick={markAllAsRead} className="action-button">
                Mark all as read
              </button>
              <button onClick={clearAll} className="action-button delete-action">
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {userNotifications.length === 0 ? (
        <div className="empty-notifications-page">
          <div className="empty-icon-large">🔔</div>
          <h2 className="empty-title">No notifications yet</h2>
          <p className="empty-description">
            When someone likes, comments, or shares your posts, you'll see it here.
          </p>
          <button onClick={() => navigate('/blog')} className="empty-cta-button">
            Browse Blog Posts
          </button>
        </div>
      ) : (
        <div className="notifications-sections">
          {groupedNotifications.today.length > 0 && (
            <div className="notification-group">
              <h2 className="notification-group-title">Today</h2>
              <div className="notification-cards">
                {groupedNotifications.today.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-card ${!notification.read ? 'notification-card-unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-card-icon">{getNotificationIcon(notification.type)}</div>
                    <div className="notification-card-content">
                      <p className="notification-card-message">
                        <strong>{notification.actorName}</strong> {notification.message}
                      </p>
                      {notification.postTitle && (
                        <p className="notification-card-post">"{notification.postTitle}"</p>
                      )}
                      <span className="notification-card-time">{formatTime(notification.timestamp)}</span>
                    </div>
                    {!notification.read && <div className="notification-card-badge">New</div>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="notification-card-delete"
                      aria-label="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.yesterday.length > 0 && (
            <div className="notification-group">
              <h2 className="notification-group-title">Yesterday</h2>
              <div className="notification-cards">
                {groupedNotifications.yesterday.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-card ${!notification.read ? 'notification-card-unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-card-icon">{getNotificationIcon(notification.type)}</div>
                    <div className="notification-card-content">
                      <p className="notification-card-message">
                        <strong>{notification.actorName}</strong> {notification.message}
                      </p>
                      {notification.postTitle && (
                        <p className="notification-card-post">"{notification.postTitle}"</p>
                      )}
                      <span className="notification-card-time">{formatTime(notification.timestamp)}</span>
                    </div>
                    {!notification.read && <div className="notification-card-badge">New</div>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="notification-card-delete"
                      aria-label="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groupedNotifications.earlier.length > 0 && (
            <div className="notification-group">
              <h2 className="notification-group-title">Earlier</h2>
              <div className="notification-cards">
                {groupedNotifications.earlier.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-card ${!notification.read ? 'notification-card-unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-card-icon">{getNotificationIcon(notification.type)}</div>
                    <div className="notification-card-content">
                      <p className="notification-card-message">
                        <strong>{notification.actorName}</strong> {notification.message}
                      </p>
                      {notification.postTitle && (
                        <p className="notification-card-post">"{notification.postTitle}"</p>
                      )}
                      <span className="notification-card-time">{formatTime(notification.timestamp)}</span>
                    </div>
                    {!notification.read && <div className="notification-card-badge">New</div>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="notification-card-delete"
                      aria-label="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
