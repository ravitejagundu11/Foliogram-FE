import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Notification, CreateNotificationData } from '../types/notification'
import { useAuth } from './AuthContext'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (data: CreateNotificationData) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  getUnreadNotifications: () => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()

  // Load all notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notifications')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Notification[]
        // Filter out any invalid notifications that don't have recipientUsername
        const validNotifications = parsed.filter(n => n.recipientUsername)
        console.log('Loaded notifications from localStorage:', {
          total: parsed.length,
          valid: validNotifications.length,
          invalid: parsed.length - validNotifications.length
        })
        setAllNotifications(validNotifications)
      } catch (err) {
        console.error('Failed to parse notifications from localStorage:', err)
        setAllNotifications([])
      }
    }
  }, [])

  // Filter notifications for current user whenever user or allNotifications change
  useEffect(() => {
    console.log('=== NOTIFICATION FILTER EFFECT RUNNING ===')
    console.log('User:', user ? { username: user.username, email: user.email } : 'NULL')
    console.log('All notifications count:', allNotifications.length)
    
    if (!user) {
      console.log('No user logged in, clearing notifications')
      setNotifications([])
      return
    }

    // Filter to only show notifications for the current user
    const userNotifications = allNotifications.filter(notif => {
      // Normalize for comparison (trim and handle null/undefined)
      const recipientUsername = (notif.recipientUsername || '').trim()
      const currentUsername = (user.username || '').trim()
      const currentEmail = (user.email || '').trim()
      
      const isForUser = recipientUsername === currentUsername || recipientUsername === currentEmail
      
      console.log('Checking notification:', {
        id: notif.id.substring(0, 10) + '...',
        type: notif.type,
        recipientUsername: `"${recipientUsername}"`,
        actorUsername: notif.actorUsername,
        currentUsername: `"${currentUsername}"`,
        currentEmail: `"${currentEmail}"`,
        message: notif.message,
        isForUser: isForUser,
        matchesUsername: recipientUsername === currentUsername,
        matchesEmail: recipientUsername === currentEmail
      })
      
      return isForUser
    })
    
    console.log('=== FILTER RESULT ===')
    console.log('Total notifications in storage:', allNotifications.length)
    console.log('Notifications for current user:', userNotifications.length)
    console.log('Current user:', { username: user.username, email: user.email })
    console.log('User notifications:', userNotifications.map(n => ({
      type: n.type,
      from: n.actorUsername,
      to: n.recipientUsername,
      message: n.message
    })))
    
    setNotifications(userNotifications)
  }, [user, allNotifications])

  // Save all notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(allNotifications))
  }, [allNotifications])

  const addNotification = (data: CreateNotificationData) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      timestamp: Date.now(),
      read: false,
    }
    setAllNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setAllNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    )
  }

  const markAllAsRead = () => {
    if (!user) return
    
    // Only mark as read notifications for current user
    setAllNotifications((prev) => 
      prev.map((notif) => {
        if (notif.recipientUsername === user.username || notif.recipientUsername === user.email) {
          return { ...notif, read: true }
        }
        return notif
      })
    )
  }

  const deleteNotification = (id: string) => {
    setAllNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const clearAll = () => {
    if (!user) return
    
    // Only clear notifications for current user
    setAllNotifications((prev) => 
      prev.filter((notif) => 
        notif.recipientUsername !== user.username && notif.recipientUsername !== user.email
      )
    )
  }

  const getUnreadNotifications = () => {
    return notifications.filter((notif) => !notif.read)
  }

  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        getUnreadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
