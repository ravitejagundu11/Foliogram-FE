import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@contexts/AuthContext'
import { useSubscription } from '@contexts/SubscriptionContext'
import { apiClient } from '@services/api'
import type { Portfolio } from '../types/portfolio'
import PageHeader from '@components/PageHeader'
import {
  Calendar,
  Bell,
  BellOff,
  ExternalLink,
  User,
  Briefcase,
  Loader,
  Search,
  Filter
} from 'lucide-react'
import '../styles/PublicPortfoliosPage.css'
import '../styles/PageHeader.css'

const PublicPortfoliosPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { subscribe, unsubscribe, isSubscribed } = useSubscription()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [templateFilter, setTemplateFilter] = useState<string>('all')
  const [subscribing, setSubscribing] = useState<string | null>(null)

  useEffect(() => {
    loadPublicPortfolios()
  }, [])

  useEffect(() => {
    filterPortfolios()
  }, [searchQuery, templateFilter, portfolios])

  const loadPublicPortfolios = async () => {
    setLoading(true)
    try {
      // Try API first
      const response = await apiClient.get<Portfolio[]>('/portfolios/public')
      const publishedPortfolios = response.filter((p: Portfolio) => p.isPublished)
      setPortfolios(publishedPortfolios)
    } catch (err) {
      console.warn('Backend API not available, loading from localStorage')
      
      // Fallback to localStorage
      const localPortfolios = JSON.parse(localStorage.getItem('portfolios') || '{}')
      const portfoliosList = Object.values(localPortfolios) as Portfolio[]
      
      // Only show published portfolios
      const publishedPortfolios = portfoliosList.filter((p: Portfolio) => p.isPublished)
      
      console.log('Loaded public portfolios:', publishedPortfolios.length)
      setPortfolios(publishedPortfolios)
    } finally {
      setLoading(false)
    }
  }

  const filterPortfolios = () => {
    let filtered = [...portfolios]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.headline?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    // Template filter
    if (templateFilter !== 'all') {
      filtered = filtered.filter(p => p.templateId === templateFilter)
    }

    setFilteredPortfolios(filtered)
  }

  const handleSubscribe = async (portfolio: Portfolio) => {
    if (!user) {
      alert('Please login to subscribe')
      navigate('/login')
      return
    }

    if (!portfolio.userId) return

    // Prevent subscribing to own portfolio
    if (portfolio.userId === user.username || portfolio.userId === user.email) {
      alert('❌ You cannot subscribe to your own portfolio!')
      return
    }

    setSubscribing(portfolio.id || null)
    
    try {
      if (isSubscribed(portfolio.userId)) {
        unsubscribe(portfolio.userId)
        alert('✓ You have unsubscribed from updates!')
      } else {
        subscribe(portfolio.userId)
        alert('✓ You are now subscribed to updates!')
      }
    } finally {
      setSubscribing(null)
    }
  }

  const handleScheduleAppointment = (portfolio: Portfolio) => {
    if (!user) {
      alert('Please login to schedule an appointment')
      navigate('/login')
      return
    }
    navigate(`/booking/${portfolio.id}`)
  }

  const handleViewPortfolio = (portfolio: Portfolio) => {
    const url = portfolio.slug || portfolio.id
    window.open(`/portfolio/${url}`, '_blank')
  }

  const getTemplateDisplayName = (templateId: string) => {
    const names: { [key: string]: string } = {
      '1': 'Classic Professional',
      '2': 'Modern Dark',
      '3': 'Project Centric',
      '4': 'Minimalist Academic',
      '5': 'Modern Academic',
      '6': 'Photography',
      '7': 'Architect',
      '8': 'Fashion Designer',
      '9': 'Interior Designer',
      '10': 'Teacher',
      // Legacy string-based IDs (if any exist)
      'classic-professional': 'Classic Professional',
      'modern-dark': 'Modern Dark',
      'project-centric': 'Project Centric',
      'minimalist-academic': 'Minimalist Academic',
      'modern-academic': 'Modern Academic',
      'photography': 'Photography',
      'architect': 'Architect',
      'fashion-designer': 'Fashion Designer',
      'interior-designer': 'Interior Designer',
      'teacher': 'Teacher'
    }
    return names[templateId] || `Template ${templateId}`
  }

  const uniqueTemplates = Array.from(new Set(portfolios.map(p => p.templateId)))

  if (loading) {
    return (
      <div className="public-portfolios-loading">
        <Loader className="spinner" size={48} />
        <p>Loading portfolios...</p>
      </div>
    )
  }

  return (
    <div className="public-portfolios-container">
      <PageHeader
        title="Discover Portfolios"
        subtitle="Explore professional portfolios, connect with creators, and schedule appointments"
        icon={Briefcase}
        actions={
          <div className="header-stats">
            <div className="stat-card">
              <Briefcase size={24} />
              <div>
                <div className="stat-number">{portfolios.length}</div>
                <div className="stat-label">Portfolios</div>
              </div>
            </div>
            <div className="stat-card">
              <User size={24} />
              <div>
                <div className="stat-number">{new Set(portfolios.map(p => p.userId)).size}</div>
                <div className="stat-label">Creators</div>
              </div>
            </div>
          </div>
        }
      />

      {/* Filters */}
      <motion.div
        className="portfolios-filters"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, headline, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={20} />
          <select value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)}>
            <option value="all">All Templates</option>
            {uniqueTemplates.map(templateId => (
              <option key={templateId} value={templateId}>
                {getTemplateDisplayName(templateId)}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      {searchQuery || templateFilter !== 'all' ? (
        <div className="results-info">
          Showing {filteredPortfolios.length} of {portfolios.length} portfolios
        </div>
      ) : null}

      {/* Portfolios Grid */}
      {filteredPortfolios.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Briefcase size={64} />
          <h3>No portfolios found</h3>
          <p>Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="portfolios-grid">
          {filteredPortfolios.map((portfolio, index) => {
            const userIsSubscribed = portfolio.userId ? isSubscribed(portfolio.userId) : false
            const isOwnPortfolio = user && (portfolio.userId === user.username || portfolio.userId === user.email)
            
            return (
              <motion.div
                key={portfolio.id}
                className="portfolio-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                {/* Card Header */}
                <div className="card-header">
                  <div className="profile-info">
                    <h3 className="portfolio-name">{portfolio.name}</h3>
                    <p className="portfolio-headline">{portfolio.headline || 'Professional Portfolio'}</p>
                  </div>
                  {portfolio.templateId && (
                    <span className="template-badge">{getTemplateDisplayName(portfolio.templateId)}</span>
                  )}
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {portfolio.description && (
                    <p className="portfolio-description">
                      {portfolio.description.length > 100
                        ? portfolio.description.substring(0, 100) + '...'
                        : portfolio.description}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="card-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleViewPortfolio(portfolio)}
                    title="View Portfolio"
                  >
                    <ExternalLink size={18} />
                    <span>View</span>
                  </button>
                  
                  {!isOwnPortfolio && (
                    <>
                      <button
                        className="action-btn schedule-btn"
                        onClick={() => handleScheduleAppointment(portfolio)}
                        title="Schedule Appointment"
                      >
                        <Calendar size={18} />
                        <span>Schedule</span>
                      </button>
                      
                      <button
                        className={`action-btn subscribe-btn ${userIsSubscribed ? 'subscribed' : ''}`}
                        onClick={() => handleSubscribe(portfolio)}
                        disabled={subscribing === portfolio.id}
                        title={userIsSubscribed ? 'Unsubscribe' : 'Subscribe for updates'}
                      >
                        {subscribing === portfolio.id ? (
                          <Loader size={18} className="spinner" />
                        ) : userIsSubscribed ? (
                          <BellOff size={18} />
                        ) : (
                          <Bell size={18} />
                        )}
                        <span>{userIsSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PublicPortfoliosPage
