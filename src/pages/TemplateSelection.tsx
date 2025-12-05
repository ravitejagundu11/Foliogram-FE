import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { templateApi, Template } from '@services/api'
import { useAuth } from '@contexts/AuthContext'
import { Check, Sparkles, Search, Home, FileText, Calendar, BarChart3, Settings, LogOut, UserCircle } from 'lucide-react'
import '../styles/TemplateSelection.css'

const TemplateSelection = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>(['All'])

  useEffect(() => {
    fetchTemplates()
    fetchCategories()
  }, [])

  const fetchTemplates = async () => {
    try {
      const data = await templateApi.getAll()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await templateApi.getCategories()
      setCategories(['All', ...data.categories])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleContinue = () => {
    if (selectedTemplate) {
      navigate(`/portfolio/configure/${selectedTemplate}`)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  }

  if (loading) {
    return (
      <div className="template-selection-loading">
        <div className="spinner"></div>
        <p>Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="template-selection-container">
      {/* Left Sidebar Navigation */}
      <motion.nav
        className="template-sidebar"
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
              className="sidebar-nav-item"
              onClick={() => navigate('/welcome')}
              title="Home"
            >
              <Home size={24} />
            </button>
            <button
              className="sidebar-nav-item active"
              onClick={() => navigate('/templates')}
              title="Templates"
            >
              <FileText size={24} />
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => isAuthenticated ? navigate('/blog') : navigate('/login')}
              title="Blogs"
            >
              <FileText size={24} />
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/login')}
              title="Appointments"
            >
              <Calendar size={24} />
            </button>
            <button
              className="sidebar-nav-item"
              onClick={() => isAuthenticated ? navigate('/analytics') : navigate('/login')}
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
                onClick={() => navigate('/login')}
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
        className="template-profile"
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

      <div className="template-selection-header">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="template-selection-title">Choose Your Template</h1>
          <p className="template-selection-subtitle">
            Select a template that best represents your style and profession
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="template-search-bar"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          className="category-tabs"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Templates Grid */}
      <motion.div
        className="templates-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={() => handleSelectTemplate(template.id)}
          >
            {/* Premium Badge */}
            {template.isPremium && (
              <div className="premium-badge">
                <Sparkles size={14} />
                <span>Premium</span>
              </div>
            )}

            {/* Selection Check */}
            {selectedTemplate === template.id && (
              <div className="selection-check">
                <Check size={20} strokeWidth={3} />
              </div>
            )}

            {/* Template Thumbnail */}
            <div className="template-thumbnail">
              <img src={template.thumbnail} alt={template.name} />
              <div className="template-overlay">
                <button className="preview-button">Preview</button>
              </div>
            </div>

            {/* Template Info */}
            <div className="template-info">
              <h3 className="template-name">{template.name}</h3>
              <p className="template-description">{template.description}</p>
              <div className="template-tags">
                {(() => {
                  try {
                    const features = JSON.parse(template.features || '[]')
                    return features.slice(0, 3).map((feature: string, index: number) => (
                      <span key={index} className="template-tag">{feature}</span>
                    ))
                  } catch {
                    return null
                  }
                })()}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="empty-state">
          <p>No templates found matching your criteria.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Continue Button */}
      {selectedTemplate && (
        <motion.div
          className="template-selection-footer"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <button
            className="continue-button"
            onClick={handleContinue}
          >
            Continue with Selected Template
          </button>
        </motion.div>
      )}
    </div>
  )
}

// Demo templates for fallback
const demoTemplates: Template[] = [
  {
    id: '1',
    name: 'Classic Professional',
    category: 'Engineers/Diploma',
    description: 'Ideal for fresh graduates, clean layout',
    thumbnail: '/templates/1.jpg',
    isPremium: false,
    tags: ['Professional', 'Clean', 'Modern'],
    layoutType: 'grid'
  },
  {
    id: '2',
    name: 'Modern UNO',
    category: 'Engineers/Diploma',
    description: 'Best for portfolio - sleek with dark theme',
    thumbnail: '/templates/2.jpg',
    isPremium: false,
    tags: ['Dark', 'Sleek', 'Portfolio'],
    layoutType: 'masonry'
  },
  {
    id: '3',
    name: 'Project-Centric',
    category: 'Engineers/Diploma',
    description: 'Highlight your best projects first',
    thumbnail: '/templates/3.jpg',
    isPremium: false,
    tags: ['Projects', 'Showcase', 'Visual'],
    layoutType: 'grid'
  },
  {
    id: '4',
    name: 'Minimalist Academic',
    category: 'Engineers/Diploma',
    description: 'Perfect for research, academic style',
    thumbnail: '/templates/4.jpg',
    isPremium: true,
    tags: ['Academic', 'Minimal', 'Clean'],
    layoutType: 'list'
  },
  {
    id: '5',
    name: 'Modern Academic',
    category: 'Engineers/Diploma',
    description: 'Best for projects, research papers',
    thumbnail: '/templates/5.jpg',
    isPremium: false,
    tags: ['Research', 'Academic', 'Professional'],
    layoutType: 'grid'
  },
  {
    id: '6',
    name: 'Photography',
    category: 'Creatives',
    description: 'Capture moments, framing creativity',
    thumbnail: '/templates/6.png',
    isPremium: false,
    tags: ['Visual', 'Gallery', 'Creative'],
    layoutType: 'masonry'
  },
  {
    id: '7',
    name: 'Architect',
    category: 'Creatives',
    description: 'Designs create the visual space',
    thumbnail: '/templates/7.png',
    isPremium: false,
    tags: ['Design', 'Visual', 'Architecture'],
    layoutType: 'grid'
  },
  {
    id: '8',
    name: 'Fashion Designer',
    category: 'Creatives',
    description: 'Style embraces artistry today',
    thumbnail: '/templates/8.jpg',
    isPremium: false,
    tags: ['Fashion', 'Style', 'Creative'],
    layoutType: 'masonry'
  },
  {
    id: '9',
    name: 'Interior Designer',
    category: 'Creatives',
    description: 'Transforming rooms into life',
    thumbnail: '/templates/9.jpg',
    isPremium: false,
    tags: ['Interior', 'Design', 'Space'],
    layoutType: 'grid'
  },
  {
    id: '10',
    name: 'Teacher',
    category: 'Creatives',
    description: 'Inspiring ideas, shaping tomorrow',
    thumbnail: '/templates/10.jpg',
    isPremium: false,
    tags: ['Education', 'Teaching', 'Impact'],
    layoutType: 'list'
  }
]

export default TemplateSelection
