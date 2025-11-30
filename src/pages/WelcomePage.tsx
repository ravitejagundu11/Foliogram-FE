import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@contexts/AuthContext'
import { apiClient } from '@services/api'
import { Home, FileText, Calendar, BarChart3, Settings, LogOut, UserCircle } from 'lucide-react'
import '../styles/WelcomePage.css'

interface Portfolio {
  id: string
  name: string
  description: string
  createdAt: string
}

const WelcomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolios = async () => {
      if (isAuthenticated && user) {
        try {
          const data = await apiClient.get<Portfolio[]>('/portfolios')
          setPortfolios(data)
        } catch (error) {
          console.error('Error fetching portfolios:', error)
          setPortfolios([])
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchPortfolios()
  }, [isAuthenticated, user])

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/signup')
    } else if (portfolios.length > 0) {
      navigate('/dashboard')
    } else {
      navigate('/dashboard') // Navigate to template selection in dashboard
    }
  }

  const handleFeatureClick = (feature: string) => {
    if (!isAuthenticated) {
      navigate('/login')
    } else {
      switch (feature) {
        case 'templates':
          navigate('/templates')
          break
        case 'blogs':
          navigate('/blog')
          break
        case 'appointments':
          navigate('/dashboard') // Update with appointments route when available
          break
        case 'analytics':
          navigate('/analytics')
          break
        default:
          navigate('/dashboard')
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  const featureVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <div className="welcome-container">
      {/* Left Sidebar Navigation */}
      <motion.nav
        className="welcome-sidebar"
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
            <button
              className="sidebar-nav-item active"
              onClick={() => navigate('/welcome')}
              title="Home"
            >
              <Home size={24} />
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => handleFeatureClick('templates')}
              title="Templates"
            >
              <FileText size={24} />
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => handleFeatureClick('blogs')}
              title="Blogs"
            >
              <FileText size={24} />
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => handleFeatureClick('appointments')}
              title="Appointments"
            >
              <Calendar size={24} />
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => handleFeatureClick('analytics')}
              title="Analytics"
            >
              <BarChart3 size={24} />
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="sidebar-bottom">
            <button className="sidebar-nav-item" title="Settings">
              <Settings size={24} />
            </button>
            {isAuthenticated && (
              <button
                className="sidebar-nav-item"
                onClick={() => {
                  navigate('/login')
                }}
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
        className="welcome-profile"
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

      {/* Background with diagonal stripe pattern */}
      <div className="welcome-background">
        <div className="diagonal-stripes"></div>
      </div>

      {/* Hero Section */}
      <motion.div
        className="welcome-hero"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="welcome-brand" variants={itemVariants}>
          <h1 className="welcome-logo">FOLIOGRAM</h1>
          <p className="welcome-tagline">Create your portfolio that makes an impression!</p>
        </motion.div>

        <motion.div className="welcome-about" variants={itemVariants}>
          <h2>About us:</h2>
          <p>
            Welcome to Foliogram - your creative playground! Build a portfolio that reflects you, share stories
            and ideas through blogs, and connect with experts or fellow dreamers for advice, collabs, or new
            opportunities. Whether you're here to showcase your talent or get inspired, Foliogram is your space
            to shine!
          </p>
        </motion.div>

        {/* Conditional Portfolio Info */}
        {isAuthenticated && !loading && portfolios.length > 0 && (
          <motion.div className="portfolio-status" variants={itemVariants}>
            <p className="portfolio-info">
              You have {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} created!
            </p>
          </motion.div>
        )}

        <motion.div className="features-intro" variants={itemVariants}>
          <h3>Because your talent deserves more than just a Google Drive folder, here are some features we offer:</h3>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="features-grid"
          variants={containerVariants}
        >
          <motion.div
            className="feature-card templates"
            variants={featureVariants}
            whileHover="hover"
            onClick={() => handleFeatureClick('templates')}
          >
            <div className="feature-icon">
              <div className="portfolio-icon">
                <span className="portfolio-text">PORTFOLIO</span>
              </div>
            </div>
            <h4>Templates</h4>
            <p>Pick a template, insert yours, and all your work shines</p>
          </motion.div>

          <motion.div
            className="feature-card blogs"
            variants={featureVariants}
            whileHover="hover"
            onClick={() => handleFeatureClick('blogs')}
          >
            <div className="feature-icon">
              <div className="blog-icon">
                <div className="blog-grid">
                  <div className="blog-item"></div>
                  <div className="blog-item"></div>
                  <div className="blog-item"></div>
                  <div className="blog-item"></div>
                </div>
              </div>
            </div>
            <h4>Blogs</h4>
            <p>Share your story or latest ideas, and connect with readers</p>
          </motion.div>

          <motion.div
            className="feature-card appointments"
            variants={featureVariants}
            whileHover="hover"
            onClick={() => handleFeatureClick('appointments')}
          >
            <div className="feature-icon">
              <div className="calendar-icon">
                <div className="calendar-header">
                  <div className="calendar-dot"></div>
                  <div className="calendar-dot"></div>
                </div>
                <div className="calendar-grid">
                  <div className="calendar-day"></div>
                  <div className="calendar-day"></div>
                  <div className="calendar-day"></div>
                  <div className="calendar-day"></div>
                  <div className="calendar-day"></div>
                  <div className="calendar-day"></div>
                </div>
              </div>
            </div>
            <h4>Appointments</h4>
            <p>Book a date, setup times, sync with the ones</p>
          </motion.div>

          <motion.div
            className="feature-card analytics"
            variants={featureVariants}
            whileHover="hover"
            onClick={() => handleFeatureClick('analytics')}
          >
            <div className="feature-icon">
              <div className="analytics-icon">
                <div className="chart-line"></div>
                <div className="chart-bars">
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
              </div>
            </div>
            <h4>Analytics</h4>
            <p>Track your progress and understand every bit</p>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div className="welcome-cta" variants={itemVariants}>
          <motion.button
            className="cta-button primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
          >
            {!isAuthenticated
              ? 'Get Started'
              : portfolios.length > 0
              ? 'Go to Dashboard'
              : 'Create Your Portfolio'}
          </motion.button>
          {!isAuthenticated && (
            <motion.button
              className="cta-button secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default WelcomePage
