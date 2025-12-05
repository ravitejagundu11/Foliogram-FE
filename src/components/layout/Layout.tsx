import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@contexts/AuthContext'
import { useNotification } from '@contexts/NotificationContext'
import { useState } from 'react'
import Footer from './Footer'
import PageSelector from '@components/common/PageSelector'
import { Home, FileText, Calendar, BarChart3, Settings, LogOut, UserCircle, Users, Book, ChevronLeft, ChevronRight, Bell, User, Layout as LayoutIcon, Shield, Folders, Briefcase, Gauge, FileBarChart, Ban, Cog, BellRing } from 'lucide-react'
import '../../styles/Layout.css'

const Layout = () => {
  const showPageSelector = import.meta.env.VITE_SHOW_PAGE_SELECTOR === 'true'
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout, hasRole } = useAuth()
  const { unreadCount } = useNotification()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isAdmin = hasRole(['admin'])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="layout-container">
      {/* Left Sidebar Navigation */}
      <motion.nav
        className={`layout-sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: isSidebarCollapsed ? '80px' : '250px'
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-content">
          {/* Logo Section */}
          <div className="sidebar-logo">
            {isSidebarCollapsed ? (
              <span className="sidebar-logo-letter">F</span>
            ) : (
              <span className="sidebar-logo-text">Foliogram</span>
            )}
          </div>

          {/* Collapse/Expand Button */}
          <button 
            className="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

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
                  {!isSidebarCollapsed && <span className="nav-label">Dashboard</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Dashboard</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/profile') ? 'active' : ''}`}
                  onClick={() => navigate('/profile')}
                  title="Profile"
                >
                  <User size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Profile</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Profile</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/blog') ? 'active' : ''}`}
                  onClick={() => navigate('/blog')}
                  title="Blog"
                >
                  <Book size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Blog</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Blog</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/users/search') ? 'active' : ''}`}
                  onClick={() => navigate('/users/search')}
                  title="Users"
                >
                  <Users size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Users</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Users</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/templates') ? 'active' : ''}`}
                  onClick={() => navigate('/templates')}
                  title="Templates"
                >
                  <LayoutIcon size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Templates</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Templates</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/my-portfolios') ? 'active' : ''}`}
                  onClick={() => navigate('/my-portfolios')}
                  title="My Portfolios"
                >
                  <Folders size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">My Portfolios</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">My Portfolios</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/portfolios') ? 'active' : ''}`}
                  onClick={() => navigate('/portfolios')}
                  title="Portfolios"
                >
                  <Briefcase size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Portfolios</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Portfolios</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/appointment-management') ? 'active' : ''}`}
                  onClick={() => navigate('/appointment-management')}
                  title="Appointments"
                >
                  <Calendar size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Appointments</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Appointments</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/analytics') ? 'active' : ''}`}
                  onClick={() => navigate('/analytics')}
                  title="Analytics"
                >
                  <BarChart3 size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Analytics</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Analytics</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/notifications') ? 'active' : ''}`}
                  onClick={() => navigate('/notifications')}
                  title="Notifications"
                >
                  <div className="sidebar-icon-wrapper">
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="sidebar-notification-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {!isSidebarCollapsed && <span className="nav-label">Notifications</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Notifications</span>}
                </button>
                {isAdmin && (
                  <>
                    <button
                      className={`sidebar-nav-item ${isActive('/admin') ? 'active' : ''}`}
                      onClick={() => navigate('/admin')}
                      title="Admin Dashboard"
                    >
                      <Gauge size={24} />
                      {!isSidebarCollapsed && <span className="nav-label">Admin Dashboard</span>}
                      {isSidebarCollapsed && <span className="nav-tooltip">Admin Dashboard</span>}
                    </button>
                    <button
                      className={`sidebar-nav-item ${isActive('/admin/user-management') ? 'active' : ''}`}
                      onClick={() => navigate('/admin/user-management')}
                      title="User Management"
                    >
                      <Shield size={24} />
                      {!isSidebarCollapsed && <span className="nav-label">User Management</span>}
                      {isSidebarCollapsed && <span className="nav-tooltip">User Management</span>}
                    </button>
                    <button
                      className={`sidebar-nav-item ${isActive('/admin/reports') ? 'active' : ''}`}
                      onClick={() => navigate('/admin/reports')}
                      title="Reports"
                    >
                      <FileBarChart size={24} />
                      {!isSidebarCollapsed && <span className="nav-label">Reports</span>}
                      {isSidebarCollapsed && <span className="nav-tooltip">Reports</span>}
                    </button>
                    <button
                      className={`sidebar-nav-item ${isActive('/admin/moderation') ? 'active' : ''}`}
                      onClick={() => navigate('/admin/moderation')}
                      title="Moderation"
                    >
                      <Ban size={24} />
                      {!isSidebarCollapsed && <span className="nav-label">Moderation</span>}
                      {isSidebarCollapsed && <span className="nav-tooltip">Moderation</span>}
                    </button>
                    <button
                      className={`sidebar-nav-item ${isActive('/admin/notifications') ? 'active' : ''}`}
                      onClick={() => navigate('/admin/notifications')}
                      title="Admin Notifications"
                    >
                      <BellRing size={24} />
                      {!isSidebarCollapsed && <span className="nav-label">Admin Notifications</span>}
                      {isSidebarCollapsed && <span className="nav-tooltip">Admin Notifications</span>}
                    </button>
                    <button
                      className={`sidebar-nav-item ${isActive('/admin/settings') ? 'active' : ''}`}
                      onClick={() => navigate('/admin/settings')}
                      title="Admin Settings"
                    >
                      <Cog size={24} />
                      {!isSidebarCollapsed && <span className="nav-label">Admin Settings</span>}
                      {isSidebarCollapsed && <span className="nav-tooltip">Admin Settings</span>}
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  className={`sidebar-nav-item ${isActive('/welcome') ? 'active' : ''}`}
                  onClick={() => navigate('/welcome')}
                  title="Home"
                >
                  <Home size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Home</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Home</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/about') ? 'active' : ''}`}
                  onClick={() => navigate('/about')}
                  title="About"
                >
                  <FileText size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">About</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">About</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/contact') ? 'active' : ''}`}
                  onClick={() => navigate('/contact')}
                  title="Contact"
                >
                  <Book size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Contact</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Contact</span>}
                </button>
                <button
                  className={`sidebar-nav-item ${isActive('/portfolios') ? 'active' : ''}`}
                  onClick={() => navigate('/portfolios')}
                  title="Portfolios"
                >
                  <Briefcase size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Portfolios</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Portfolios</span>}
                </button>
              </>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="sidebar-bottom">
            {isAuthenticated ? (
              <>
                <button 
                  className="sidebar-nav-item settings-btn" 
                  title="Settings" 
                  onClick={() => navigate('/profile')}
                >
                  <Settings size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Settings</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Settings</span>}
                </button>
                <button
                  className="sidebar-nav-item logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Logout</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Logout</span>}
                </button>
              </>
            ) : (
              <>
                <button
                  className="sidebar-nav-item signin-btn"
                  onClick={() => navigate('/login')}
                  title="Sign In"
                >
                  <UserCircle size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Sign In</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Sign In</span>}
                </button>
                <button
                  className="sidebar-nav-item signup-btn"
                  onClick={() => navigate('/signup')}
                  title="Sign Up"
                >
                  <User size={24} />
                  {!isSidebarCollapsed && <span className="nav-label">Sign Up</span>}
                  {isSidebarCollapsed && <span className="nav-tooltip">Sign Up</span>}
                </button>
              </>
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
      <div className={`layout-main ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
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
