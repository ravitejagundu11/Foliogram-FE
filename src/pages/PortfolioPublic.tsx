import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { 
  ExternalLink, 
  Github, 
  Mail, 
  Star, 
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Send,
  MapPin,
  Calendar,
  User,
  Phone,
  Video,
  Bell,
  BellOff
} from 'lucide-react'
import { apiClient } from '../services/api'
import type { Portfolio, Project, Skill, Testimonial } from '../types/portfolio'
import '../styles/PortfolioPublic.css'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

const PortfolioPublic = () => {
  const { username, portfolioId } = useParams<{ username?: string; portfolioId?: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal & Carousel States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Contact Form State
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [sendingContact, setSendingContact] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  
  // Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    const fetchPortfolioData = async () => {
      // portfolioId from URL params could actually be a slug, not an ID
      const identifier = username || portfolioId
      if (!identifier) {
        console.error('No identifier provided')
        return
      }

      try {
        setLoading(true)
        
        let portfolioData: Portfolio | null = null
        let projectsData: Project[] = []
        let skillsData: Skill[] = []
        let testimonialsData: Testimonial[] = []

        console.log('Fetching portfolio with identifier:', identifier)
        console.log('URL params - portfolioId:', portfolioId, 'username:', username)

        // Try fetching from API first
        try {
          const endpoint = username 
            ? `/portfolios/public/${username}` 
            : `/portfolios/${identifier}/public`
          
          console.log('Trying API endpoint:', endpoint)
          
          const response = await apiClient.get<{
            portfolio: Portfolio
            projects: Project[]
            skills: Skill[]
            testimonials: Testimonial[]
          }>(endpoint)

          portfolioData = response.portfolio
          projectsData = response.projects
          skillsData = response.skills
          testimonialsData = response.testimonials
          
          console.log('Successfully loaded from API')
        } catch (apiError) {
          console.warn('Backend API not available, fetching from localStorage:', apiError)
          
          // Fallback to localStorage
          const localPortfolios = JSON.parse(localStorage.getItem('portfolios') || '{}')
          const allPortfolios = Object.values(localPortfolios) as Portfolio[]
          
          console.log('Total portfolios in localStorage:', allPortfolios.length)
          console.log('Available portfolio IDs:', Object.keys(localPortfolios))
          console.log('Available portfolio slugs:', allPortfolios.map(p => p.slug))
          
          // Search through all portfolios - identifier could be slug, ID, or username
          portfolioData = allPortfolios.find((p: Portfolio) => {
            // Check multiple possibilities
            const matches = 
              p.id === identifier ||                    // Direct ID match
              p.slug === identifier ||                  // Slug match
              localPortfolios[identifier]?.id === p.id  // ID used as key in localStorage
            
            if (matches) {
              console.log('✓ Found portfolio:', p.name, '| ID:', p.id, '| Slug:', p.slug)
            }
            
            return matches
          }) || null
          
          // If still not found, try direct localStorage access
          if (!portfolioData && localPortfolios[identifier]) {
            console.log('Found by direct localStorage key access')
            portfolioData = localPortfolios[identifier]
          }

          if (!portfolioData) {
            console.error('❌ Portfolio not found!')
            console.error('Searched for identifier:', identifier)
            console.error('Available portfolios:', allPortfolios.map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug
            })))
            throw new Error('Portfolio not found')
          }

          console.log('✓ Successfully loaded portfolio from localStorage:', portfolioData.name)

          // Extract embedded data from portfolio
          projectsData = portfolioData.projects || []
          skillsData = portfolioData.skills || []
          testimonialsData = portfolioData.testimonials || []
          
          console.log('Loaded data - Projects:', projectsData.length, 'Skills:', skillsData.length, 'Testimonials:', testimonialsData.length)
        }

        // Check if portfolio is published
        if (!portfolioData || !portfolioData.isPublished) {
          setError('This portfolio is not published or does not exist.')
          setLoading(false)
          return
        }

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

  // Testimonial Carousel Handlers
  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    )
  }

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }

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

  // Contact Form Handler
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingContact(true)

    try {
      await apiClient.post(`/portfolios/${portfolio?.id}/contact`, contactForm)
      setContactSuccess(true)
      setContactForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setContactSuccess(false), 5000)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingContact(false)
    }
  }

  const handleScheduleAppointment = () => {
    // Navigate to booking page with portfolio ID
    navigate(`/booking/${portfolio?.id || portfolioId}`)
  }

  const handleSubscribe = async () => {
    if (!portfolio) return
    
    // Prevent users from subscribing to their own portfolio
    if (currentUser) {
      const storedUser = localStorage.getItem('user')
      const currentUserId = storedUser ? JSON.parse(storedUser).username : null
      
      // Check multiple possible matches
      if (portfolio.userId === currentUser.username || 
          portfolio.userId === currentUser.email || 
          portfolio.userId === currentUserId ||
          portfolio.name === currentUser.username) {
        alert('❌ You cannot subscribe to your own portfolio!');
        return;
      }
    }
    
    setSubscribing(true)
    try {
      // Check current subscription status
      const currentStatus = isSubscribed
      
      if (currentStatus) {
        // Unsubscribe
        await apiClient.delete(`/subscriptions/${portfolio.id}`)
        setIsSubscribed(false)
        alert('✓ You have unsubscribed from updates!')
      } else {
        // Subscribe
        await apiClient.post('/subscriptions', {
          portfolioId: portfolio.id,
          subscribedAt: new Date().toISOString()
        })
        setIsSubscribed(true)
        alert('✓ You are now subscribed to updates!')
      }
    } catch (error: any) {
      console.warn('Subscription API not available, using local storage:', error.message)
      
      // Fallback: Use localStorage
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}')
      
      if (isSubscribed) {
        delete subscriptions[portfolio.id]
        setIsSubscribed(false)
        alert('✓ You have unsubscribed from updates!')
      } else {
        subscriptions[portfolio.id] = {
          portfolioId: portfolio.id,
          subscribedAt: new Date().toISOString()
        }
        setIsSubscribed(true)
        alert('✓ You are now subscribed to updates!')
      }
      
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions))
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

  // Apply theme colors
  const style = {
    '--primary-color': portfolio.theme?.primaryColor || '#3b82f6',
    '--secondary-color': portfolio.theme?.secondaryColor || '#8b5cf6',
    '--accent-color': portfolio.theme?.accentColor || '#10b981',
    '--text-color': portfolio.theme?.textColor || '#1f2937',
    '--background-color': portfolio.theme?.backgroundColor || '#ffffff',
  } as React.CSSProperties

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <div className="portfolio-public" style={style}>
      {/* Share Button - Fixed Position */}
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {portfolio.profilePicture && (
            <motion.img
              src={portfolio.profilePicture}
              alt={portfolio.name}
              className="profile-picture"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
            />
          )}
          <motion.h1 
            className="portfolio-name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {portfolio.name}
          </motion.h1>
          <motion.p 
            className="portfolio-headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {portfolio.headline}
          </motion.p>
          {portfolio.description && (
            <motion.p 
              className="portfolio-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {portfolio.description}
            </motion.p>
          )}
          
          {/* Social Links */}
          {portfolio.socialLinks && (
            <motion.div 
              className="social-links"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {portfolio.socialLinks.github && (
                <a href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer">
                  <Github size={24} />
                </a>
              )}
              {portfolio.socialLinks.linkedin && (
                <a href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin size={24} />
                </a>
              )}
              {portfolio.socialLinks.twitter && (
                <a href={portfolio.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter size={24} />
                </a>
              )}
              {portfolio.socialLinks.website && (
                <a href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={24} />
                </a>
              )}
            </motion.div>
          )}
          
          {/* Action Buttons */}
          <motion.div
            className="action-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={handleScheduleAppointment}
              className="action-button appointment-button"
            >
              <Video size={20} />
              Schedule Appointment
            </button>
            
            {/* Only show Subscribe button if user is not the portfolio owner */}
            {(() => {
              // Check if current user owns this portfolio
              if (currentUser) {
                const storedUser = localStorage.getItem('user')
                const currentUserId = storedUser ? JSON.parse(storedUser).username : null
                
                const isOwner = portfolio.userId === currentUser.username || 
                               portfolio.userId === currentUser.email || 
                               portfolio.userId === currentUserId ||
                               portfolio.name === currentUser.username;
                
                if (isOwner) return null; // Don't show button if owner
              }
              
              return (
                <button
                  onClick={handleSubscribe}
                  className={`action-button subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
                  disabled={subscribing}
                >
                  {isSubscribed ? <BellOff size={20} /> : <Bell size={20} />}
                  {subscribing ? 'Processing...' : (isSubscribed ? 'Unsubscribe' : 'Subscribe')}
                </button>
              );
            })()}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      {portfolio.sections.about && portfolio.description && (
        <section className="about-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              About Me
            </motion.h2>
            <motion.div 
              className="about-content"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p>{portfolio.description}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {portfolio.sections.education && portfolio.sectionContent?.education && portfolio.sectionContent.education.length > 0 && (
        <section className="education-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {portfolio.sectionNames?.education || 'Education'}
            </motion.h2>
            <div className="timeline">
              {portfolio.sectionContent.education.map((edu: any, index: number) => (
                <motion.div 
                  key={edu.id} 
                  className="timeline-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h3>{edu.schoolName}</h3>
                    <h4>{edu.level} - {edu.course}</h4>
                    <p className="timeline-date">
                      {edu.startDate && new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {' - '}
                      {edu.endDate && new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {portfolio.sections.experience && portfolio.sectionContent?.experience && portfolio.sectionContent.experience.length > 0 && (
        <section className="experience-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {portfolio.sectionNames?.experience || 'Experience'}
            </motion.h2>
            <div className="timeline">
              {portfolio.sectionContent.experience.map((exp: any, index: number) => (
                <motion.div 
                  key={exp.id} 
                  className="timeline-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h3>{exp.role}</h3>
                    <h4>{exp.company} • {exp.type}</h4>
                    <p className="timeline-date">
                      {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {' - '}
                      {exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </p>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="achievements-list">
                        {exp.achievements.filter((a: string) => a.trim()).map((achievement: string, idx: number) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {portfolio.sections.projects && projects.length > 0 && (
        <section className="projects-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {portfolio.sectionNames?.projects || 'Projects'}
            </motion.h2>
            <div className="projects-grid">
              {projects.map((project, index) => (
                <motion.div 
                  key={project.id} 
                  className="project-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedProject(project)
                    setCurrentImageIndex(0)
                  }}
                >
                  {project.images.length > 0 && (
                    <div className="project-image">
                      <img src={project.images[0]} alt={project.title} />
                      <div className="project-overlay">
                        <span>View Project</span>
                      </div>
                    </div>
                  )}
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">
                      {project.description.length > 120 
                        ? `${project.description.substring(0, 120)}...` 
                        : project.description}
                    </p>
                    
                    {project.techStack.length > 0 && (
                      <div className="tech-stack">
                        {project.techStack.slice(0, 4).map((tech) => (
                          <span key={tech} className="tech-tag">{tech}</span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="tech-tag">+{project.techStack.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Publications Section */}
      {portfolio.sections.publications && portfolio.sectionContent?.publications && portfolio.sectionContent.publications.length > 0 && (
        <section className="publications-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {portfolio.sectionNames?.publications || 'Publications'}
            </motion.h2>
            <div className="publications-list">
              {portfolio.sectionContent.publications.map((pub: any, index: number) => (
                <motion.div 
                  key={pub.id} 
                  className="publication-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3>{pub.title}</h3>
                  <p className="publication-org">{pub.organization}</p>
                  <p className="publication-date">
                    {pub.date && new Date(pub.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </p>
                  {pub.description && <p className="publication-desc">{pub.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {portfolio.sections.skills && skills.length > 0 && (
        <section className="skills-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {portfolio.sectionNames?.skills || 'Skills & Expertise'}
            </motion.h2>
            <div className="skills-categories">
              {Object.entries(groupedSkills).map(([category, categorySkills], catIndex) => (
                <motion.div 
                  key={category} 
                  className="skill-category"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <h3 className="category-name">{category}</h3>
                  <div className="skills-list">
                    {categorySkills.map((skill, index) => (
                      <motion.div 
                        key={skill.id} 
                        className="skill-item"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="skill-header">
                          <span className="skill-name">{skill.name}</span>
                          <span className="skill-percentage">{skill.proficiency * 20}%</span>
                        </div>
                        <div className="skill-progress-bar">
                          <motion.div
                            className="skill-progress-fill"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.proficiency * 20}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.05 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Carousel Section */}
      {portfolio.sections.testimonials && testimonials.length > 0 && (
        <section className="testimonials-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {portfolio.sectionNames?.testimonials || 'What People Say'}
            </motion.h2>
            
            <div className="testimonials-carousel">
              <button 
                className="carousel-button prev"
                onClick={prevTestimonial}
                disabled={testimonials.length <= 1}
              >
                <ChevronLeft size={24} />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonialIndex}
                  className="testimonial-slide"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="testimonial-card-large">
                    <div className="testimonial-quote">"</div>
                    <p className="testimonial-text">
                      {testimonials[currentTestimonialIndex].content}
                    </p>
                    
                    <div className="testimonial-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < (testimonials[currentTestimonialIndex].rating || 5) ? 'filled' : 'empty'}
                        />
                      ))}
                    </div>

                    <div className="testimonial-author-info">
                      {testimonials[currentTestimonialIndex].avatar ? (
                        <img
                          src={testimonials[currentTestimonialIndex].avatar}
                          alt={testimonials[currentTestimonialIndex].name}
                          className="author-avatar"
                        />
                      ) : (
                        <div className="author-avatar-placeholder">
                          {testimonials[currentTestimonialIndex].name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="author-details">
                        <h4>{testimonials[currentTestimonialIndex].name}</h4>
                        <p>
                          {testimonials[currentTestimonialIndex].role}
                          {testimonials[currentTestimonialIndex].company && 
                            ` at ${testimonials[currentTestimonialIndex].company}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button 
                className="carousel-button next"
                onClick={nextTestimonial}
                disabled={testimonials.length <= 1}
              >
                <ChevronRight size={24} />
              </button>

              {/* Carousel Indicators */}
              {testimonials.length > 1 && (
                <div className="carousel-indicators">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentTestimonialIndex ? 'active' : ''}`}
                      onClick={() => setCurrentTestimonialIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {portfolio.sections.contact && (
        <section id="contact" className="contact-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {portfolio.sectionNames?.contact || 'Get In Touch'}
            </motion.h2>
            
            <div className="contact-content">
              <motion.div 
                className="contact-info"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3>Let's Connect</h3>
                <p>Feel free to reach out for collaborations, opportunities, or just a friendly chat!</p>
                
                <div className="contact-details">
                  {/* Display custom contact info if provided */}
                  {portfolio.sectionContent?.contact && portfolio.sectionContent.contact.length > 0 ? (
                    <>
                      {portfolio.sectionContent.contact.map((contact: any, index: number) => (
                        <div key={contact.id || index} className="contact-info-group">
                          {contact.name && (
                            <div className="contact-detail-item">
                              <User size={20} />
                              <span>{contact.name}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="contact-detail-item">
                              <Mail size={20} />
                              <a href={`mailto:${contact.email}`}>{contact.email}</a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="contact-detail-item">
                              <Phone size={20} />
                              <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                            </div>
                          )}
                          {contact.address && (
                            <div className="contact-detail-item">
                              <MapPin size={20} />
                              <span>{contact.address}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    /* Default contact info if no custom contact provided */
                    <>
                      {portfolio.contactEmail && (
                        <div className="contact-detail-item">
                          <Mail size={20} />
                          <a href={`mailto:${portfolio.contactEmail}`}>{portfolio.contactEmail}</a>
                        </div>
                      )}
                      
                      <div className="contact-detail-item">
                        <MapPin size={20} />
                        <span>Available for remote work</span>
                      </div>
                      
                      <div className="contact-detail-item">
                        <Calendar size={20} />
                        <span>Response time: 24-48 hours</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.form 
                className="contact-form"
                onSubmit={handleContactSubmit}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                {contactSuccess && (
                  <motion.div 
                    className="success-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ✓ Message sent successfully! I'll get back to you soon.
                  </motion.div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    placeholder="Project inquiry, collaboration, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    placeholder="Tell me about your project or inquiry..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={sendingContact}
                >
                  <Send size={18} />
                  {sendingContact ? 'Sending...' : 'Send Message'}
                </button>
              </motion.form>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="portfolio-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} {portfolio.name}. All rights reserved.</p>
          <p className="footer-credit">Built with ❤️ using <a href="/" target="_blank">Foligram</a></p>
        </div>
      </footer>

      {/* Project Modal */}
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
    </div>
  )
}

export default PortfolioPublic
