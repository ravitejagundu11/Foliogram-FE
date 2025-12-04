import React, { createContext, useContext, useState, ReactNode } from 'react'
import { authApi } from '@services/api'

export interface UserData {
  username: string
  email: string
  firstName: string
  lastName: string
  contactNumber: string
  profileImage?: string
  role?: 'user' | 'admin' | 'recruiter'
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserData | null
  login: (userData: UserData) => void
  logout: () => Promise<void>
  updateUser: (userData: Partial<UserData>) => void
  setProfileImage: (image: string) => void
  hasRole: (allowedRoles: Array<'user' | 'admin' | 'recruiter'>) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true'
  })
  const [user, setUser] = useState<UserData | null>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = (userData: UserData) => {
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')
  }

  const hasRole = (allowedRoles: Array<'user' | 'admin' | 'recruiter'>) => {
    if (!user) return false
    const role = user.role ?? 'user'
    return allowedRoles.includes(role)
  }

  const logout = async () => {
    try {
      // Call logout API
      await authApi.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error)
    } finally {
      // Clear local state and storage
      setIsAuthenticated(false)
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('token')
    }
  }

  const updateUser = (userData: Partial<UserData>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const setProfileImage = (image: string) => {
    if (user) {
      const updatedUser = { ...user, profileImage: image }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, setProfileImage, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
