import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@contexts/AuthContext'
import { apiClient } from '@services/api'
import type { Portfolio } from '../types/portfolio'
import { transformPortfolio } from '../utils/portfolioTransform'
import PageHeader from '@components/PageHeader'
import {
  Eye,
  Edit,
  Trash2,
  Globe,
  Lock,
  Link as LinkIcon,
  Calendar,
  TrendingUp,
  Heart,
  Plus,
  AlertCircle,
  Check,
  X,
  Briefcase,
  FileText
} from 'lucide-react'
import '../styles/MyPortfolios.css'
import '../styles/PageHeader.css'

const MyPortfolios = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [newSlug, setNewSlug] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadPortfolios()
  }, [isAuthenticated, navigate])

  const loadPortfolios = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try API first
      console.log('Fetching portfolios from API...')
      const portfoliosData = await apiClient.get('/portfolios/my-portfolios')
      console.log('API Response (already unwrapped by apiClient):', portfoliosData)
      
      // apiClient.get() already unwraps response.data.data, so portfoliosData is the array directly
      const portfoliosArray = Array.isArray(portfoliosData) ? portfoliosData : []
      console.log('Portfolios array before transform:', portfoliosArray)
      
      // Transform backend format to frontend format
      const transformedPortfolios = portfoliosArray.map(transformPortfolio)
      console.log('Transformed portfolios:', transformedPortfolios)
      setPortfolios(transformedPortfolios)
      console.log('Portfolios set successfully, count:', transformedPortfolios.length)
    } catch (err) {
      console.error('Error loading portfolios from API:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        response: (err as any)?.response,
        status: (err as any)?.response?.status
      })
      
      // Fallback to localStorage
      try {
        // Get current user's identifiers from AuthContext
        const currentUsername = user?.username || ''
        const currentEmail = user?.email || ''
        
        console.log('========== MyPortfolios Debug ==========')
        console.log('Current user:', { username: currentUsername, email: currentEmail })
        console.log('Looking for portfolios with userId matching:', currentUsername, 'OR', currentEmail)
        console.log('========================================')
        
        const allPortfolios: Portfolio[] = []
        
        // Method 1: Check the 'portfolios' object (used by PortfolioConfig save)
        const portfoliosObj = localStorage.getItem('portfolios')
        if (portfoliosObj) {
          try {
            const parsedPortfolios = JSON.parse(portfoliosObj)
            const portfoliosList = Object.values(parsedPortfolios) as Portfolio[]
            
            console.log('All portfolios from localStorage:', portfoliosList.map(p => ({ id: p.id, name: p.name, userId: p.userId })))
            
            // Filter to only include portfolios that belong to current user
            // Compare against username and email since userId can be either
            // Use case-insensitive comparison and trim whitespace
            const userPortfolios = portfoliosList.filter(portfolio => {
              const portfolioUserId = (portfolio.userId || '').toLowerCase().trim()
              const username = currentUsername.toLowerCase().trim()
              const email = currentEmail.toLowerCase().trim()
              const matches = portfolioUserId === username || portfolioUserId === email
              console.log(`Portfolio "${portfolio.name}": userId="${portfolio.userId}" (normalized: "${portfolioUserId}"), matches: ${matches}`)
              return matches
            })
            
            console.log('Filtered user portfolios:', userPortfolios.map(p => ({ id: p.id, name: p.name, userId: p.userId })))
            
            allPortfolios.push(...userPortfolios)
            console.log('Loaded portfolios from "portfolios" object:', userPortfolios.length)
          } catch (parseErr) {
            console.warn('Failed to parse portfolios object:', parseErr)
          }
        }
        
        // Method 2: Check individual portfolio_${id} keys
        console.log('Checking individual portfolio_* keys in localStorage...')
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('portfolio_')) {
            try {
              const portfolioData = localStorage.getItem(key)
              if (portfolioData) {
                const portfolio = JSON.parse(portfolioData) as Portfolio
                
                // Check if portfolio belongs to current user (case-insensitive)
                const portfolioUserId = (portfolio.userId || '').toLowerCase().trim()
                const username = currentUsername.toLowerCase().trim()
                const email = currentEmail.toLowerCase().trim()
                const matches = portfolioUserId === username || portfolioUserId === email
                
                console.log(`Individual key "${key}": name="${portfolio.name}", userId="${portfolio.userId}", matches=${matches}`)
                
                if (matches) {
                  // Check if not already added from portfolios object
                  const exists = allPortfolios.some(p => p.id === portfolio.id)
                  if (!exists) {
                    allPortfolios.push(portfolio)
                    console.log(`Added portfolio "${portfolio.name}" from individual key`)
                  }
                }
              }
            } catch (parseErr) {
              console.warn(`Failed to parse portfolio from key ${key}:`, parseErr)
            }
          }
        }
        
        // Sort by creation date (newest first)
        allPortfolios.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        
        console.log('========== Final Results ==========')
        console.log('Total portfolios found:', allPortfolios.length)
        console.log('Portfolio names:', allPortfolios.map(p => p.name))
        console.log('=====================================')
        
        // MIGRATION: Fix portfolios with empty userId
        if (allPortfolios.length === 0 && (currentUsername || currentEmail)) {
          console.log('⚠️ No portfolios found for current user. Checking for portfolios with empty userId...')
          
          const portfoliosObj = localStorage.getItem('portfolios')
          if (portfoliosObj) {
            const parsedPortfolios = JSON.parse(portfoliosObj)
            const portfoliosList = Object.values(parsedPortfolios) as Portfolio[]
            const orphanedPortfolios = portfoliosList.filter(p => !p.userId || p.userId.trim() === '')
            
            if (orphanedPortfolios.length > 0) {
              console.log(`Found ${orphanedPortfolios.length} portfolio(s) with empty userId. Migrating to current user...`)
              
              let migrated = 0
              orphanedPortfolios.forEach(portfolio => {
                console.log(`Migrating portfolio "${portfolio.name}" to userId: ${currentEmail || currentUsername}`)
                portfolio.userId = currentEmail || currentUsername
                parsedPortfolios[portfolio.id] = portfolio
                
                // Also update individual key if it exists
                const individualKey = `portfolio_${portfolio.id}`
                if (localStorage.getItem(individualKey)) {
                  localStorage.setItem(individualKey, JSON.stringify(portfolio))
                }
                
                allPortfolios.push(portfolio)
                migrated++
              })
              
              // Save updated portfolios object
              localStorage.setItem('portfolios', JSON.stringify(parsedPortfolios))
              console.log(`✅ Successfully migrated ${migrated} portfolio(s)`)
              
              // Sort again after migration
              allPortfolios.sort((a, b) => 
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              )
            } else {
              console.log('No orphaned portfolios found.')
            }
          }
        }
        
        setPortfolios(allPortfolios)
        console.log('Total portfolios loaded from localStorage:', allPortfolios.length)
      } catch (localErr) {
        console.error('Error loading from localStorage:', localErr)
        setError('Failed to load portfolios')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleView = (portfolio: Portfolio) => {
    const url = portfolio.slug || portfolio.id
    window.open(`/portfolio/${url}`, '_blank')
  }

  const handleEdit = (portfolio: Portfolio) => {
    navigate(`/portfolio/configure/${portfolio.templateId}`, { 
      state: { portfolioId: portfolio.id, editMode: true } 
    })
  }

  const handleTogglePublish = async (portfolio: Portfolio) => {
    try {
      const newPublishStatus = !portfolio.isPublished
      
      // Try API first
      try {
        await apiClient.put(`/portfolios/${portfolio.id}/publish`, {
          isPublished: newPublishStatus
        })
      } catch (apiErr) {
        console.warn('API update failed, using localStorage:', apiErr)
      }
      
      // Update localStorage - both formats
      const updatedPortfolio = {
        ...portfolio,
        isPublished: newPublishStatus,
        ...(newPublishStatus 
          ? { publishedAt: new Date().toISOString(), unpublishedAt: undefined }
          : { unpublishedAt: new Date().toISOString() }
        )
      }
      
      // Update individual portfolio key
      localStorage.setItem(`portfolio_${portfolio.id}`, JSON.stringify(updatedPortfolio))
      
      // Update portfolios object (used by Analytics)
      const portfoliosObj = localStorage.getItem('portfolios')
      if (portfoliosObj) {
        try {
          const parsedPortfolios = JSON.parse(portfoliosObj)
          parsedPortfolios[portfolio.id] = updatedPortfolio
          localStorage.setItem('portfolios', JSON.stringify(parsedPortfolios))
        } catch (parseErr) {
          console.warn('Failed to update portfolios object:', parseErr)
        }
      }
      
      // Update state
      setPortfolios(portfolios.map(p => 
        p.id === portfolio.id ? updatedPortfolio : p
      ))
      
      alert(`Portfolio ${newPublishStatus ? 'published' : 'unpublished'} successfully!`)
    } catch (err) {
      console.error('Error toggling publish status:', err)
      alert('Failed to update publish status')
    }
  }

  const handleChangeSlug = async (portfolio: Portfolio) => {
    if (!newSlug.trim()) {
      alert('Please enter a valid URL slug')
      return
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(newSlug)) {
      alert('URL slug can only contain lowercase letters, numbers, and hyphens')
      return
    }
    
    try {
      // Try API first
      try {
        await apiClient.put(`/portfolios/${portfolio.id}/slug`, {
          slug: newSlug
        })
      } catch (apiErr) {
        console.warn('API slug update failed, using localStorage:', apiErr)
      }
      
      // Update localStorage - both formats
      const updatedPortfolio = {
        ...portfolio,
        slug: newSlug
      }
      
      // Update individual portfolio key
      localStorage.setItem(`portfolio_${portfolio.id}`, JSON.stringify(updatedPortfolio))
      
      // Update portfolios object (used by Analytics)
      const portfoliosObj = localStorage.getItem('portfolios')
      if (portfoliosObj) {
        try {
          const parsedPortfolios = JSON.parse(portfoliosObj)
          parsedPortfolios[portfolio.id] = updatedPortfolio
          localStorage.setItem('portfolios', JSON.stringify(parsedPortfolios))
        } catch (parseErr) {
          console.warn('Failed to update portfolios object:', parseErr)
        }
      }
      
      // Update state
      setPortfolios(portfolios.map(p => 
        p.id === portfolio.id ? updatedPortfolio : p
      ))
      
      setEditingSlug(null)
      setNewSlug('')
      alert('Portfolio URL updated successfully!')
    } catch (err) {
      console.error('Error updating slug:', err)
      alert('Failed to update portfolio URL')
    }
  }

  const handleDelete = async (portfolio: Portfolio) => {
    if (deleteConfirm !== portfolio.id) {
      setDeleteConfirm(portfolio.id)
      return
    }
    
    try {
      // Try API first
      try {
        await apiClient.delete(`/portfolios/${portfolio.id}`)
      } catch (apiErr) {
        console.warn('API delete failed, using localStorage:', apiErr)
      }
      
      // Delete from localStorage - both formats
      // Delete individual portfolio key
      localStorage.removeItem(`portfolio_${portfolio.id}`)
      
      // Delete from portfolios object (used by Analytics)
      const portfoliosObj = localStorage.getItem('portfolios')
      if (portfoliosObj) {
        try {
          const parsedPortfolios = JSON.parse(portfoliosObj)
          delete parsedPortfolios[portfolio.id]
          localStorage.setItem('portfolios', JSON.stringify(parsedPortfolios))
        } catch (parseErr) {
          console.warn('Failed to update portfolios object:', parseErr)
        }
      }
      
      // Also delete related data
      localStorage.removeItem(`projects_${portfolio.id}`)
      localStorage.removeItem(`skills_${portfolio.id}`)
      localStorage.removeItem(`testimonials_${portfolio.id}`)
      
      // Update state
      setPortfolios(portfolios.filter(p => p.id !== portfolio.id))
      setDeleteConfirm(null)
      
      alert('Portfolio deleted permanently!')
    } catch (err) {
      console.error('Error deleting portfolio:', err)
      alert('Failed to delete portfolio')
    }
  }

  // Calculate statistics from portfolios
  const stats = useMemo(() => {
    const published = portfolios.filter(p => p.isPublished)
    const unpublished = portfolios.filter(p => !p.isPublished)
    const totalViews = portfolios.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalLikes = portfolios.reduce((sum, p) => sum + (p.likes || 0), 0)
    const avgViewsPerPortfolio = portfolios.length > 0 ? Math.round(totalViews / portfolios.length) : 0
    const avgLikesPerPortfolio = portfolios.length > 0 ? Math.round(totalLikes / portfolios.length) : 0

    return {
      total: portfolios.length,
      published: published.length,
      unpublished: unpublished.length,
      totalViews,
      totalLikes,
      avgViewsPerPortfolio,
      avgLikesPerPortfolio
    }
  }, [portfolios])

  const getTemplateName = (templateId: string) => {
    const templateNames: Record<string, string> = {
      'template1': 'Modern Minimalist',
      'template2': 'Creative Studio',
      'template3': 'Professional Corporate',
      'template4': 'Tech Developer',
      'template5': 'Designer Portfolio'
    }
    return templateNames[templateId] || 'Custom Template'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="my-portfolios-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your portfolios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-portfolios-container">
      <PageHeader
        title="My Portfolios"
        subtitle="Manage all your published portfolios in one place"
        icon={Briefcase}
        actions={
          <button
            className="create-portfolio-btn"
            onClick={() => navigate('/templates')}
          >
            <Plus size={20} />
            Create New Portfolio
          </button>
        }
      />

      {/* Statistics Dashboard */}
      {portfolios.length > 0 && (
        <motion.div
          className="statistics-dashboard"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="stat-card-enhanced">
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#dbeafe' }}>
              <Briefcase size={24} style={{ color: '#1e40af' }} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Portfolios</div>
              <div className="stat-sublabel">{stats.published} published, {stats.unpublished} draft</div>
            </div>
          </div>

          <div className="stat-card-enhanced">
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#d1fae5' }}>
              <Globe size={24} style={{ color: '#065f46' }} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.published}</div>
              <div className="stat-label">Published</div>
              <div className="stat-sublabel">{((stats.published / stats.total) * 100).toFixed(0)}% of total</div>
            </div>
          </div>

          <div className="stat-card-enhanced">
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef3c7' }}>
              <TrendingUp size={24} style={{ color: '#92400e' }} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalViews.toLocaleString()}</div>
              <div className="stat-label">Total Views</div>
              <div className="stat-sublabel">Avg {stats.avgViewsPerPortfolio}/portfolio</div>
            </div>
          </div>

          <div className="stat-card-enhanced">
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#fecaca' }}>
              <Heart size={24} style={{ color: '#991b1b' }} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalLikes.toLocaleString()}</div>
              <div className="stat-label">Total Likes</div>
              <div className="stat-sublabel">Avg {stats.avgLikesPerPortfolio}/portfolio</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          className="error-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Portfolios Grid */}
      {portfolios.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-icon">
            <Globe size={64} />
          </div>
          <h2>No Portfolios Yet</h2>
          <p>Start creating your first portfolio to showcase your work</p>
          <button
            className="create-portfolio-btn"
            onClick={() => navigate('/templates')}
          >
            <Plus size={20} />
            Create Your First Portfolio
          </button>
        </motion.div>
      ) : (
        <div className="portfolios-grid">
          {portfolios.map((portfolio, index) => (
            <motion.div
              key={portfolio.id}
              className="portfolio-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Card Header with Status Badge */}
              <div className="card-header">
                <div className="status-badge-container">
                  <div className={`status-badge ${portfolio.isPublished ? 'published' : 'unpublished'}`}>
                    {portfolio.isPublished ? (
                      <>
                        <Globe size={14} />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>Unpublished</span>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="portfolio-name">{portfolio.name || 'Untitled Portfolio'}</h3>
                <p className="portfolio-headline">{portfolio.headline}</p>
                <div className="template-info">
                  <FileText size={14} />
                  <span>{getTemplateName(portfolio.templateId)}</span>
                </div>
              </div>

              {/* Portfolio Info */}
              <div className="portfolio-info">
                <div className="info-row">
                  <Calendar size={16} />
                  <span className="info-label">Created:</span>
                  <span className="info-value">{formatDate(portfolio.createdAt)}</span>
                </div>
                {portfolio.isPublished && portfolio.publishedAt && (
                  <div className="info-row">
                    <Globe size={16} />
                    <span className="info-label">Published:</span>
                    <span className="info-value">{formatDate(portfolio.publishedAt)}</span>
                  </div>
                )}
                <div className="info-row stats-row">
                  <div className="stat">
                    <TrendingUp size={16} />
                    <span>{portfolio.views || 0} views</span>
                  </div>
                  <div className="stat">
                    <Heart size={16} />
                    <span>{portfolio.likes || 0} likes</span>
                  </div>
                </div>
              </div>

              {/* URL Section */}
              <div className="url-section">
                {editingSlug === portfolio.id ? (
                  <div className="url-edit-container">
                    <div className="url-input-group">
                      <LinkIcon size={16} />
                      <input
                        type="text"
                        className="url-input"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="Enter new URL slug"
                        autoFocus
                      />
                    </div>
                    <div className="url-actions">
                      <button
                        className="url-action-btn save"
                        onClick={() => handleChangeSlug(portfolio)}
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="url-action-btn cancel"
                        onClick={() => {
                          setEditingSlug(null)
                          setNewSlug('')
                        }}
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="url-display">
                    <LinkIcon size={16} />
                    <span className="url-text">
                      /portfolio/{portfolio.slug || portfolio.id}
                    </span>
                    <button
                      className="url-change-btn"
                      onClick={() => {
                        setEditingSlug(portfolio.id)
                        setNewSlug(portfolio.slug || '')
                      }}
                      title="Change URL"
                    >
                      Edit URL
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="card-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => handleView(portfolio)}
                  title="View Portfolio"
                >
                  <Eye size={18} />
                  <span>View</span>
                </button>
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(portfolio)}
                  title="Edit Portfolio"
                >
                  <Edit size={18} />
                  <span>Edit</span>
                </button>
                <button
                  className={`action-btn publish-btn ${portfolio.isPublished ? 'unpublish' : 'publish'}`}
                  onClick={() => handleTogglePublish(portfolio)}
                  title={portfolio.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {portfolio.isPublished ? (
                    <>
                      <Lock size={18} />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Globe size={18} />
                      <span>Publish</span>
                    </>
                  )}
                </button>
                <button
                  className={`action-btn delete-btn ${deleteConfirm === portfolio.id ? 'confirm' : ''}`}
                  onClick={() => handleDelete(portfolio)}
                  title={deleteConfirm === portfolio.id ? 'Click again to confirm' : 'Delete Portfolio'}
                >
                  <Trash2 size={18} />
                  <span>{deleteConfirm === portfolio.id ? 'Confirm?' : 'Delete'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyPortfolios
