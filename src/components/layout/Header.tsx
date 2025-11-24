import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useEffect, useRef, useState } from 'react'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout, user, hasRole } = useAuth()
  const [open, setOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const adminMenuRef = useRef<HTMLDivElement | null>(null)

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
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-extrabold text-gray-900">Foliogram</h1>
          </Link>
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <Link to="/" className={getLinkClassName('/')}>
                Home
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/dashboard" className={getLinkClassName('/dashboard')}>
                Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/blog" className={getLinkClassName('/blog')}>
                Blog
              </Link>
            )}
            <Link to="/about" className={getLinkClassName('/about')}>
              About
            </Link>
            <Link to="/contact" className={getLinkClassName('/contact')}>
              Contact
            </Link>

            {isAuthenticated ? (
              <>
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
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
