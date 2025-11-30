import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@contexts/AuthContext'
import Footer from './Footer'
import PageSelector from '@components/common/PageSelector'
import { Home, FileText, Calendar, BarChart3, Settings, LogOut, UserCircle, Users, Book } from 'lucide-react'
import '../../styles/Layout.css'

const Layout = () => {
  const showPageSelector = import.meta.env.VITE_SHOW_PAGE_SELECTOR === 'true'
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="layout-container">
      {/* Left Sidebar Navigation */}
      <motion.nav
        className="layout-sidebar"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sidebar-content">
          {/* Logo Section */}
          <div className="sidebar-logo">
            <Home className="sidebar-logo-icon" />
          </div>

          {/* Navigation Items */}
          <div className="sidebar-nav">
            {isAuthenticated ? (
              <>
                <button
                  className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={() => navigate('/dashboard')}
                  title="Dashboard"
                >
                  <Home size={24} />
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/blog') ? 'active' : ''}`}
                  onClick={() => navigate('/blog')}
                  title="Blog"
                >
                  <Book size={24} />
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/users/search') ? 'active' : ''}`}
                  onClick={() => navigate('/users/search')}
                  title="Users"
                >
                  <Users size={24} />
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/appointment-management') ? 'active' : ''}`}
                  onClick={() => navigate('/appointment-management')}
                  title="Appointments"
                >
                  <Calendar size={24} />
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/analytics') ? 'active' : ''}`}
                  onClick={() => navigate('/analytics')}
                  title="Analytics"
                >
                  <BarChart3 size={24} />
                </button>
              </>
            ) : (
              <>
                <button
                  className={`sidebar-nav-item ${isActive('/') ? 'active' : ''}`}
                  onClick={() => navigate('/')}
                  title="Home"
                >
                  <Home size={24} />
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/about') ? 'active' : ''}`}
                  onClick={() => navigate('/about')}
                  title="About"
                >
                  <FileText size={24} />
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/contact') ? 'active' : ''}`}
                  onClick={() => navigate('/contact')}
                  title="Contact"
                >
                  <Book size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="sidebar-bottom">
            <button className="sidebar-nav-item" title="Settings" onClick={() => navigate('/profile')}>
              <Settings size={24} />
            </button>
            {isAuthenticated && (
              <button
                className="sidebar-nav-item"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={24} />
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Top Right Profile Icon */}
      <motion.div
        className="layout-profile"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isAuthenticated && user ? (
          <button
            className="profile-button"
            onClick={() => navigate('/profile')}
            title={`${user.firstName} ${user.lastName}`}
          >
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="profile-image"
              />
            ) : (
              <div className="profile-avatar">
                {`${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`}
              </div>
            )}
          </button>
        ) : (
          <button
            className="profile-button"
            onClick={() => navigate('/login')}
            title="Sign In"
          >
            <UserCircle size={36} strokeWidth={1.5} />
          </button>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="layout-main">
        <main className="layout-content">
          <Outlet />
        </main>
        <Footer />
        {showPageSelector && <PageSelector />}
      </div>
    </div>
  )
}

export default Layout
