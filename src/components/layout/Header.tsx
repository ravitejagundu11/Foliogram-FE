import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useNotification } from '@contexts/NotificationContext'
import { useEffect, useRef, useState } from 'react'
import NotificationPanel from '@components/NotificationPanel'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout, user, hasRole } = useAuth()
  const { unreadCount } = useNotification()
  const [open, setOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const adminMenuRef = useRef<HTMLDivElement | null>(null)
  const notificationRef = useRef<HTMLDivElement | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`
  const isAdmin = hasRole(['admin'])

  const getLinkClassName = (path: string) => {
    const isActive = location.pathname === path
    return `text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md transition-colors ${
      isActive ? 'font-bold border-b-2 border-gray-900' : ''
    }`
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo + Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
              <h1 className="text-2xl font-extrabold text-gray-900">Foliogram</h1>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              {/* Public Navigation Links */}
              {!isAuthenticated && (
                <Link to="/" className={getLinkClassName('/')}>
                  Home
                </Link>
              )}
              <Link to="/about" className={getLinkClassName('/about')}>
                About
              </Link>
              <Link to="/contact" className={getLinkClassName('/contact')}>
                Contact
              </Link>

              {/* Authenticated Navigation Links */}
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className={getLinkClassName('/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/blog" className={getLinkClassName('/blog')}>
                    Blog
                  </Link>
                  <Link to="/users/search" className={getLinkClassName('/users/search')}>
                    Users
                  </Link>
                  <Link to="/analytics" className={getLinkClassName('/analytics')}>
                    Analytics
                  </Link>
                  <Link to="/appointment-management" className={getLinkClassName('/appointment-managemnet')}>
                    Appointment Management
                  </Link>
                  <Link to="/booking-page" className={getLinkClassName('/booking-page')}>
                    Book Appointment
                  </Link>

                  {/* Admin Dropdown */}
                  {isAdmin && (
                    <div className="relative" ref={adminMenuRef}>
                      <button
                        onClick={() => setAdminOpen((s) => !s)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md transition-colors"
                        aria-expanded={adminOpen}
                        aria-haspopup="true"
                      >
                        <span className="text-sm font-medium">Administrator</span>
                        <svg className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {adminOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            <Link
                              to="/admin/user-management"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setAdminOpen(false)}
                            >
                              User Management
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right side: Notification Bell + Profile Icon Only */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setNotificationOpen((s) => !s)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notificationOpen && <NotificationPanel onClose={() => setNotificationOpen(false)} />}
                </div>

                {/* User Profile Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setOpen((s) => !s)}
                    className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 px-2 py-1"
                    aria-expanded={open}
                    aria-haspopup="true"
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="avatar" className="w-9 h-9 rounded-full object-cover border" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold border">
                        {initials || user?.username?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className="hidden md:inline text-sm font-medium text-gray-700">{user?.firstName}</span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {open && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setOpen(false)}
                        >
                          Profile
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="text-gray-900 hover:text-gray-700 px-3 py-1 rounded-md font-medium">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
