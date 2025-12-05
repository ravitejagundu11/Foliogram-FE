import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { 
  ExternalLink, 
  Github, 
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react'
import { apiClient, portfolioApi } from '../services/api'
import type { Portfolio, Project, Skill, Testimonial } from '../types/portfolio'
import ClassicProfessionalTemplate from '../components/templates/ClassicProfessionalTemplate'
import ModernDarkTemplate from '../components/templates/ModernDarkTemplate'
import ProjectCentricTemplate from '../components/templates/ProjectCentricTemplate'
import MinimalistAcademicTemplate from '../components/templates/MinimalistAcademicTemplate'
import ModernAcademicTemplate from '../components/templates/ModernAcademicTemplate'
import PhotographyTemplate from '../components/templates/PhotographyTemplate'
import ArchitectTemplate from '../components/templates/ArchitectTemplate'
import FashionDesignerTemplate from '../components/templates/FashionDesignerTemplate'
import InteriorDesignerTemplate from '../components/templates/InteriorDesignerTemplate'
import TeacherTemplate from '../components/templates/TeacherTemplate'
import '../styles/PortfolioPublic.css'

const PortfolioPublic = () => {
  const { username, portfolioId } = useParams<{ username?: string; portfolioId?: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { subscribe, unsubscribe, isSubscribed: checkSubscribed } = useSubscription()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal & Carousel States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Subscription State
  const [subscribing, setSubscribing] = useState(false)
  const isSubscribed = portfolio?.userId ? checkSubscribed(portfolio.userId) : false

  // Template Renderer Function
  const renderTemplate = () => {
    if (!portfolio) return null

    const templateProps = {
      portfolio,
      projects,
      skills,
      testimonials,
      onProjectClick: setSelectedProject,
      onScheduleAppointment: handleScheduleAppointment,
      onSubscribe: handleSubscribe,
      isSubscribed,
      subscribing,
      currentUser
    }

    // Route to different templates based on templateId
    switch (portfolio.templateId) {
      case '1': // Classic Professional
        return <ClassicProfessionalTemplate {...templateProps} />
      case '2': // Modern Dark (Modern UNO)
        return <ModernDarkTemplate {...templateProps} />
      case '3': // Project-Centric
        return <ProjectCentricTemplate {...templateProps} />
      case '4': // Minimalist Academic
        return <MinimalistAcademicTemplate {...templateProps} />
      case '5': // Modern Academic
        return <ModernAcademicTemplate {...templateProps} />
      case '6': // Photography
        return <PhotographyTemplate {...templateProps} />
      case '7': // Architect
        return <ArchitectTemplate {...templateProps} />
      case '8': // Fashion Designer
        return <FashionDesignerTemplate {...templateProps} />
      case '9': // Interior Designer
        return <InteriorDesignerTemplate {...templateProps} />
      case '10': // Teacher
        return <TeacherTemplate {...templateProps} />
      default:
        // Default to classic template
        return <ClassicProfessionalTemplate {...templateProps} />
    }
  }

  useEffect(() => {
    // Fetch portfolio data on mount
    const fetchPortfolioData = async () => {
      // portfolioId from URL params could actually be a slug, not an ID
      const identifier = username || portfolioId
      if (!identifier) {
        console.error('No identifier provided')
        setError('Portfolio not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        console.log('Fetching portfolio with identifier:', identifier)
        console.log('URL params - portfolioId:', portfolioId, 'username:', username)

        // Determine if identifier is a UUID or slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
        
        console.log('Fetching from public API, isUUID:', isUUID)
        
        const portfolioData = isUUID 
          ? await portfolioApi.getPublicById(identifier)
          : await portfolioApi.getPublicBySlug(identifier)

        const projectsData = portfolioData.projects || []
        const skillsData = portfolioData.skills || []
        const testimonialsData = portfolioData.testimonials || []
        
        console.log('Successfully loaded from API:', portfolioData)
        
        // Set the data
        setPortfolio(portfolioData)
        setProjects(projectsData)
        setSkills(skillsData)
        setTestimonials(testimonialsData)
      } catch (err) {
        console.error('Error fetching portfolio:', err)
        setError('Failed to load portfolio. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [username, portfolioId])

  // Project Image Navigation
  const nextImage = () => {
    if (!selectedProject) return
    setCurrentImageIndex((prev) => 
      prev === selectedProject.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    if (!selectedProject) return
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedProject.images.length - 1 : prev - 1
    )
  }

  // Share Handlers
  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = `Check out ${portfolio?.name}'s portfolio!`
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
    
    setShowShareMenu(false)
  }

  const handleScheduleAppointment = () => {
    // Navigate to booking page with portfolio ID
    navigate(`/booking/${portfolio?.id || portfolioId}`)
  }

  const handleSubscribe = () => {
    if (!portfolio || !portfolio.userId) return
    
    // Prevent users from subscribing to their own portfolio
    if (currentUser) {
      if (portfolio.userId === currentUser.username || 
          portfolio.userId === currentUser.email || 
          portfolio.name === currentUser.username) {
        alert('❌ You cannot subscribe to your own portfolio!')
        return
      }
    }
    
    setSubscribing(true)
    try {
      if (isSubscribed) {
        unsubscribe(portfolio.userId)
        alert('✓ You have unsubscribed from updates!')
      } else {
        subscribe(portfolio.userId)
        alert('✓ You are now subscribed to updates!')
      }
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="spinner"></div>
        <p>Loading portfolio...</p>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="portfolio-error">
        <h2>Portfolio Not Found</h2>
        <p>{error || 'The requested portfolio does not exist.'}</p>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            marginTop: '20px', 
            padding: '10px 20px', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <details>
            <summary style={{ cursor: 'pointer' }}>Debug Info (Click to expand)</summary>
            <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
              URL Params:{'\n'}
              - portfolioId: {portfolioId || 'not set'}{'\n'}
              - username: {username || 'not set'}{'\n'}
              {'\n'}
              Check browser console for more details.
            </pre>
          </details>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Render the selected template */}
      {renderTemplate()}

      {/* Share Button - Fixed Position (Common across all templates) */}
      <div className="share-button-container">
        <button 
          className="share-button"
          onClick={() => setShowShareMenu(!showShareMenu)}
        >
          <Share2 size={20} />
        </button>
        
        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              className="share-menu"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button onClick={() => handleShare('facebook')}>
                <Facebook size={18} />
                Facebook
              </button>
              <button onClick={() => handleShare('twitter')}>
                <Twitter size={18} />
                Twitter
              </button>
              <button onClick={() => handleShare('linkedin')}>
                <Linkedin size={18} />
                LinkedIn
              </button>
              <button onClick={() => handleShare('copy')}>
                <LinkIcon size={18} />
                Copy Link
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Project Modal - Common across all templates */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="project-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="project-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close"
                onClick={() => setSelectedProject(null)}
              >
                <X size={24} />
              </button>

              {/* Image Gallery */}
              {selectedProject.images.length > 0 && (
                <div className="modal-gallery">
                  <img 
                    src={selectedProject.images[currentImageIndex]} 
                    alt={selectedProject.title}
                    className="modal-image"
                  />
                  
                  {selectedProject.images.length > 1 && (
                    <>
                      <button className="gallery-nav prev" onClick={prevImage}>
                        <ChevronLeft size={24} />
                      </button>
                      <button className="gallery-nav next" onClick={nextImage}>
                        <ChevronRight size={24} />
                      </button>
                      
                      <div className="gallery-indicators">
                        {selectedProject.images.map((_, index) => (
                          <button
                            key={index}
                            className={`gallery-indicator ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Project Details */}
              <div className="modal-content">
                <h2>{selectedProject.title}</h2>
                <p className="modal-description">{selectedProject.description}</p>

                {selectedProject.techStack.length > 0 && (
                  <div className="modal-tech-stack">
                    <h4>Technologies Used</h4>
                    <div className="tech-tags">
                      {selectedProject.techStack.map((tech) => (
                        <span key={tech} className="tech-tag-large">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  {selectedProject.demoUrl && (
                    <a 
                      href={selectedProject.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="modal-button primary"
                    >
                      <ExternalLink size={18} />
                      Live Demo
                    </a>
                  )}
                  {selectedProject.codeUrl && (
                    <a 
                      href={selectedProject.codeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="modal-button secondary"
                    >
                      <Github size={18} />
                      View Code
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default PortfolioPublic
