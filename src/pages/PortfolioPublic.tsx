import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  Calendar
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

  useEffect(() => {
    const fetchPortfolioData = async () => {
      const identifier = username || portfolioId
      if (!identifier) return

      try {
        setLoading(true)
        
        // Mock data for demonstration (remove when backend is ready)
        const mockPortfolio: Portfolio = {
          id: '1',
          userId: 'user1',
          name: 'Sarah Johnson',
          contactEmail: 'sarah.johnson@example.com',
          slug: 'sarahjohnson',
          templateId: 'modern-minimal',
          headline: 'Full-Stack Developer & UI/UX Enthusiast',
          description: 'Passionate about creating beautiful, functional, and user-centered digital experiences. With 5+ years of experience in web development, I specialize in React, Node.js, and modern web technologies.',
          profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
          theme: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            accentColor: '#10b981',
            backgroundColor: '#ffffff',
            textColor: '#1f2937'
          },
          typography: {
            headingFont: 'Inter',
            bodyFont: 'Inter',
            fontSize: 'medium'
          },
          layout: {
            headerStyle: 'centered',
            spacing: 'comfortable',
            cardStyle: 'rounded'
          },
          sections: {
            about: true,
            experience: true,
            education: true,
            projects: true,
            skills: true,
            contact: true
          },
          socialLinks: {
            github: 'https://github.com/sarahjohnson',
            linkedin: 'https://linkedin.com/in/sarahjohnson',
            twitter: 'https://twitter.com/sarahjohnson',
            website: 'https://sarahjohnson.dev'
          },
          isPublished: true,
          views: 1250,
          likes: 89,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-20T15:30:00Z'
        }

        const mockProjects: Project[] = [
          {
            id: '1',
            portfolioId: '1',
            title: 'E-Commerce Platform',
            description: 'A full-featured e-commerce platform built with React, Node.js, and MongoDB. Includes user authentication, product management, shopping cart, payment integration with Stripe, and an admin dashboard for managing orders and inventory.',
            images: [
              'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=500&fit=crop',
              'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop',
              'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop'
            ],
            techStack: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe', 'Redux', 'Tailwind CSS'],
            demoUrl: 'https://ecommerce-demo.example.com',
            codeUrl: 'https://github.com/sarahjohnson/ecommerce-platform',
            featured: true,
            order: 0,
            createdAt: '2024-03-10T10:00:00Z',
            updatedAt: '2024-11-15T12:00:00Z'
          },
          {
            id: '2',
            portfolioId: '1',
            title: 'Task Management App',
            description: 'A collaborative task management application with real-time updates using Socket.io. Features include drag-and-drop kanban boards, team collaboration, file attachments, and deadline tracking.',
            images: [
              'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
              'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop'
            ],
            techStack: ['React', 'TypeScript', 'Socket.io', 'PostgreSQL', 'Material-UI'],
            demoUrl: 'https://taskmanager-demo.example.com',
            codeUrl: 'https://github.com/sarahjohnson/task-manager',
            featured: true,
            order: 1,
            createdAt: '2024-05-20T10:00:00Z',
            updatedAt: '2024-10-22T14:30:00Z'
          },
          {
            id: '3',
            portfolioId: '1',
            title: 'Weather Dashboard',
            description: 'A beautiful weather dashboard that displays current weather, 7-day forecast, and weather maps. Integrates with OpenWeather API and uses geolocation for automatic location detection.',
            images: [
              'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&h=500&fit=crop'
            ],
            techStack: ['React', 'Next.js', 'OpenWeather API', 'Chart.js', 'CSS Modules'],
            demoUrl: 'https://weather-dashboard.example.com',
            codeUrl: 'https://github.com/sarahjohnson/weather-dashboard',
            featured: false,
            order: 2,
            createdAt: '2024-07-08T10:00:00Z',
            updatedAt: '2024-09-15T11:20:00Z'
          },
          {
            id: '4',
            portfolioId: '1',
            title: 'Blog CMS',
            description: 'A modern content management system for bloggers with markdown support, SEO optimization, and analytics. Built with a headless architecture for flexibility.',
            images: [
              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop'
            ],
            techStack: ['Next.js', 'GraphQL', 'Prisma', 'PostgreSQL', 'AWS S3'],
            demoUrl: 'https://blog-cms-demo.example.com',
            codeUrl: 'https://github.com/sarahjohnson/blog-cms',
            featured: false,
            order: 3,
            createdAt: '2024-08-12T10:00:00Z',
            updatedAt: '2024-11-01T16:45:00Z'
          }
        ]

        const mockSkills: Skill[] = [
          // Frontend
          { id: '1', portfolioId: '1', name: 'React', category: 'Frontend', proficiency: 5, order: 0 },
          { id: '2', portfolioId: '1', name: 'Next.js', category: 'Frontend', proficiency: 4, order: 1 },
          { id: '3', portfolioId: '1', name: 'TypeScript', category: 'Frontend', proficiency: 5, order: 2 },
          { id: '4', portfolioId: '1', name: 'Vue.js', category: 'Frontend', proficiency: 3, order: 3 },
          { id: '5', portfolioId: '1', name: 'Tailwind CSS', category: 'Frontend', proficiency: 5, order: 4 },
          { id: '6', portfolioId: '1', name: 'Redux', category: 'Frontend', proficiency: 4, order: 5 },
          
          // Backend
          { id: '7', portfolioId: '1', name: 'Node.js', category: 'Backend', proficiency: 5, order: 0 },
          { id: '8', portfolioId: '1', name: 'Express', category: 'Backend', proficiency: 5, order: 1 },
          { id: '9', portfolioId: '1', name: 'GraphQL', category: 'Backend', proficiency: 4, order: 2 },
          { id: '10', portfolioId: '1', name: 'REST API', category: 'Backend', proficiency: 5, order: 3 },
          { id: '11', portfolioId: '1', name: 'Python', category: 'Backend', proficiency: 3, order: 4 },
          
          // Database
          { id: '12', portfolioId: '1', name: 'MongoDB', category: 'Database', proficiency: 4, order: 0 },
          { id: '13', portfolioId: '1', name: 'PostgreSQL', category: 'Database', proficiency: 4, order: 1 },
          { id: '14', portfolioId: '1', name: 'Redis', category: 'Database', proficiency: 3, order: 2 },
          { id: '15', portfolioId: '1', name: 'Prisma', category: 'Database', proficiency: 4, order: 3 },
          
          // DevOps
          { id: '16', portfolioId: '1', name: 'Docker', category: 'DevOps', proficiency: 4, order: 0 },
          { id: '17', portfolioId: '1', name: 'AWS', category: 'DevOps', proficiency: 3, order: 1 },
          { id: '18', portfolioId: '1', name: 'CI/CD', category: 'DevOps', proficiency: 4, order: 2 },
          { id: '19', portfolioId: '1', name: 'Git', category: 'DevOps', proficiency: 5, order: 3 },
          
          // Tools
          { id: '20', portfolioId: '1', name: 'Figma', category: 'Tools', proficiency: 4, order: 0 },
          { id: '21', portfolioId: '1', name: 'VS Code', category: 'Tools', proficiency: 5, order: 1 },
          { id: '22', portfolioId: '1', name: 'Postman', category: 'Tools', proficiency: 5, order: 2 },
          { id: '23', portfolioId: '1', name: 'Jira', category: 'Tools', proficiency: 4, order: 3 }
        ]

        const mockTestimonials: Testimonial[] = [
          {
            id: '1',
            portfolioId: '1',
            name: 'Michael Chen',
            role: 'Senior Product Manager',
            company: 'TechCorp Inc.',
            content: 'Sarah is an exceptional developer who consistently delivers high-quality work. Her attention to detail and ability to understand complex requirements makes her a valuable asset to any team. She led our e-commerce platform redesign and exceeded all expectations.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
            rating: 5,
            order: 0,
            createdAt: '2024-09-15T10:00:00Z'
          },
          {
            id: '2',
            portfolioId: '1',
            name: 'Emily Rodriguez',
            role: 'CEO',
            company: 'StartupHub',
            content: 'Working with Sarah was a game-changer for our company. She not only delivered a beautiful and functional product but also provided valuable insights that improved our overall user experience. Her technical expertise and communication skills are outstanding.',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
            rating: 5,
            order: 1,
            createdAt: '2024-10-02T14:30:00Z'
          },
          {
            id: '3',
            portfolioId: '1',
            name: 'David Thompson',
            role: 'Lead Developer',
            company: 'Digital Solutions',
            content: 'Sarah\'s code quality is exceptional. She writes clean, maintainable code and always follows best practices. Her problem-solving skills and ability to work under pressure make her an excellent team player. Highly recommended!',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
            rating: 5,
            order: 2,
            createdAt: '2024-10-20T09:15:00Z'
          }
        ]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Uncomment below when backend is ready
        /*
        const endpoint = username 
          ? `/portfolios/public/${username}` 
          : `/portfolios/${identifier}/public`
        
        const portfolioData = await apiClient.get<{
          portfolio: Portfolio
          projects: Project[]
          skills: Skill[]
          testimonials: Testimonial[]
        }>(endpoint)

        setPortfolio(portfolioData.portfolio)
        setProjects(portfolioData.projects)
        setSkills(portfolioData.skills)
        setTestimonials(portfolioData.testimonials)
        */

        // Using mock data
        setPortfolio(mockPortfolio)
        setProjects(mockProjects)
        setSkills(mockSkills)
        setTestimonials(mockTestimonials)
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
          
          {portfolio.contactEmail && (
            <motion.button
              onClick={() => navigate('/booking-page')}
              className="contact-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Mail size={20} />
              Get in Touch
            </motion.button>
          )}
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
              Projects
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
              Skills & Expertise
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
      {testimonials.length > 0 && (
        <section className="testimonials-section">
          <div className="section-container">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              What People Say
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
              Get In Touch
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
