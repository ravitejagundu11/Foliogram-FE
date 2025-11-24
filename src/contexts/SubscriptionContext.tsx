import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'

interface Subscription {
  subscriberId: string
  subscribedToUsername: string
  timestamp: number
}

interface SubscriptionContextType {
  subscriptions: Subscription[]
  subscribe: (username: string) => void
  unsubscribe: (username: string) => void
  isSubscribed: (username: string) => boolean
  getSubscribedUsers: () => string[]
  getSubscribers: (username: string) => string[]
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('subscriptions')
    if (stored) {
      setSubscriptions(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions))
  }, [subscriptions])

  const subscribe = (username: string) => {
    if (!user || user.username === username) return
    
    const exists = subscriptions.find(
      (s) => s.subscriberId === user.username && s.subscribedToUsername === username
    )
    
    if (!exists) {
      setSubscriptions([
        ...subscriptions,
        {
          subscriberId: user.username,
          subscribedToUsername: username,
          timestamp: Date.now(),
        },
      ])

      // Send notification to the user being subscribed to
      addNotification({
        type: 'subscription',
        recipientUsername: username,
        actorUsername: user.username,
        actorName: `${user.firstName} ${user.lastName}`,
        message: 'subscribed to you',
      })
    }
  }

  const unsubscribe = (username: string) => {
    if (!user) return
    setSubscriptions(
      subscriptions.filter(
        (s) => !(s.subscriberId === user.username && s.subscribedToUsername === username)
      )
    )
  }

  const isSubscribed = (username: string): boolean => {
    if (!user) return false
    return subscriptions.some(
      (s) => s.subscriberId === user.username && s.subscribedToUsername === username
    )
  }

  const getSubscribedUsers = (): string[] => {
    if (!user) return []
    return subscriptions
      .filter((s) => s.subscriberId === user.username)
      .map((s) => s.subscribedToUsername)
  }

  const getSubscribers = (username: string): string[] => {
    return subscriptions
      .filter((s) => s.subscribedToUsername === username)
      .map((s) => s.subscriberId)
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        subscribe,
        unsubscribe,
        isSubscribed,
        getSubscribedUsers,
        getSubscribers,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return context
}
