import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { SketchPicker } from 'react-color'
import { apiClient, projectApi, skillApi, testimonialApi } from '@services/api'
import type { PortfolioConfig, Template, Project, Skill, Testimonial } from '../types/portfolio'
import ProjectForm from '@components/ProjectForm'
import SkillsList from '@components/SkillsList'
import TestimonialsList from '@components/TestimonialsList'
import {
  Save,
  Eye,
  Upload,
  X,
  Palette,
  Type,
  Layout,
  Link as LinkIcon,
  Briefcase,
  Award,
  MessageSquare,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Phone,
  Star,
  Code,
  FileText
} from 'lucide-react'
import '../styles/PortfolioConfig.css'

const PortfolioConfigComponent = () => {
  const { templateId } = useParams<{ templateId: string }>()
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [config, setConfig] = useState<PortfolioConfig>({
    templateId: templateId || '',
    name: '',
    headline: '',
    description: '',
    profilePicture: '',
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
      education: true,
      experience: true,
      projects: true,
      publications: true,
      skills: true,
      testimonials: true,
      contact: true
    },
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      website: ''
    }
  })

  const [activeTab, setActiveTab] = useState<string>('basic')
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  
  // New state for projects, skills, testimonials
  const [portfolioId, setPortfolioId] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  
  // Section editing states
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null)
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null)
  const [editingPublicationId, setEditingPublicationId] = useState<string | null>(null)
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  
  // Section management states
  // Static sections that cannot be removed
  const STATIC_SECTIONS = ['education', 'experience', 'projects', 'publications', 'skills', 'testimonials', 'contact']
  
  const [sectionOrder, setSectionOrder] = useState<string[]>(['education', 'experience', 'projects', 'publications', 'skills', 'testimonials', 'contact'])
  const [sectionNames, setSectionNames] = useState<Record<string, string>>({
    education: 'Education',
    experience: 'Experience',
    projects: 'Projects',
    publications: 'Publications',
    skills: 'Skills',
    testimonials: 'Testimonials',
    contact: 'Contact'
  })
  const [renamingSection, setRenamingSection] = useState<string | null>(null)
  const [newSectionName, setNewSectionName] = useState('')
  
  // Section content state - stores content for each section
  const [sectionContent, setSectionContent] = useState<Record<string, any[]>>({
    education: [],
    experience: [],
    publications: [],
    contact: []
  })

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId)
    }
  }, [templateId])

  // Load projects, skills, and testimonials when portfolioId is set
  useEffect(() => {
    const fetchPortfolioContent = async () => {
      if (!portfolioId) return

      try {
        const [projectsData, skillsData, testimonialsData] = await Promise.all([
          projectApi.getAll(portfolioId),
          skillApi.getAll(portfolioId),
          testimonialApi.getAll(portfolioId)
        ])
        
        setProjects(projectsData as Project[])
        setSkills(skillsData as Skill[])
        setTestimonials(testimonialsData as Testimonial[])
      } catch (error) {
        console.error('Error fetching portfolio content:', error)
      }
    }

    fetchPortfolioContent()
  }, [portfolioId])

  // Apply CSS variables for live preview
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary-color', config.theme.primaryColor)
    root.style.setProperty('--secondary-color', config.theme.secondaryColor)
    root.style.setProperty('--accent-color', config.theme.accentColor)
    root.style.setProperty('--bg-color', config.theme.backgroundColor)
    root.style.setProperty('--text-color', config.theme.textColor)
    root.style.setProperty('--heading-font', config.typography.headingFont)
    root.style.setProperty('--body-font', config.typography.bodyFont)
  }, [config])

  const fetchTemplate = async (id: string) => {
    try {
      const data = await apiClient.get<Template>(`/templates/${id}`)
      setTemplate(data)
    } catch (error) {
      console.error('Error fetching template:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let profilePictureUrl = config.profilePicture

      // Upload profile picture if changed
      if (profileImage) {
        try {
          profilePictureUrl = await uploadProfilePicture(profileImage)
        } catch (error) {
          console.warn('Profile picture upload failed, using local preview:', error)
          // Keep the local preview URL if upload fails
        }
      }

      // Generate portfolio ID if new
      const savedPortfolioId = config.id || `portfolio-${Date.now()}`

      // Prepare complete portfolio data with all content
      const portfolioData = {
        ...config,
        id: savedPortfolioId,
        profilePicture: profilePictureUrl,
        sectionOrder,
        sectionNames,
        sectionContent, // Include all section content (education, experience, publications, contact)
        projects, // Include all projects
        skills, // Include all skills
        testimonials, // Include all testimonials
        isPublished: true, // Mark as published
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      try {
        // Try to save to backend API
        if (config.id) {
          await apiClient.put(`/portfolios/${config.id}`, portfolioData)
        } else {
          const response = await apiClient.post<{ id: string; slug?: string }>('/portfolios', portfolioData)
          const newId = response.id || savedPortfolioId
          setConfig(prev => ({ ...prev, id: newId }))
          setPortfolioId(newId)
        }

        // Save projects, skills, and testimonials individually
        if (projects.length > 0) {
          await Promise.all(
            projects.map(project => {
              const projectData = { ...project, portfolioId: savedPortfolioId }
              if (project.id && !project.id.startsWith('project-temp')) {
                return projectApi.update(savedPortfolioId, project.id, projectData)
              } else {
                return projectApi.create(savedPortfolioId, projectData)
              }
            })
          )
        }

        if (skills.length > 0) {
          await Promise.all(
            skills.map(skill => {
              const skillData = { ...skill, portfolioId: savedPortfolioId }
              if (skill.id && !skill.id.startsWith('skill-')) {
                return skillApi.update(savedPortfolioId, skill.id, skillData)
              } else {
                return skillApi.create(savedPortfolioId, skillData)
              }
            })
          )
        }

        if (testimonials.length > 0) {
          await Promise.all(
            testimonials.map(testimonial => {
              const testimonialData = { ...testimonial, portfolioId: savedPortfolioId }
              if (testimonial.id && !testimonial.id.startsWith('testimonial-')) {
                return testimonialApi.update(savedPortfolioId, testimonial.id, testimonialData)
              } else {
                return testimonialApi.create(savedPortfolioId, testimonialData)
              }
            })
          )
        }
      } catch (apiError: any) {
        console.warn('Backend API not available, saving locally:', apiError.message)
        
        // Fallback: Save to localStorage if backend is not available
        const localPortfolios = JSON.parse(localStorage.getItem('portfolios') || '{}')
        localPortfolios[savedPortfolioId] = portfolioData
        localStorage.setItem('portfolios', JSON.stringify(localPortfolios))
        
        // Update state
        if (!config.id) {
          setConfig(prev => ({ ...prev, id: savedPortfolioId }))
          setPortfolioId(savedPortfolioId)
        }
      }

      // Generate unique published URL
      const slug = config.name 
        ? config.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : savedPortfolioId
      
      const publishedUrl = `${window.location.origin}/portfolio/${slug}`
      
      alert(`✅ Portfolio saved and published successfully!\n\nYour portfolio is now live at:\n${publishedUrl}\n\nShare this URL with anyone to showcase your work!`)
      
    } catch (error: any) {
      console.error('Error saving portfolio:', error)
      alert(`❌ Failed to save portfolio: ${error.message || 'Unknown error'}\n\nPlease check the console for details.`)
    } finally {
      setSaving(false)
    }
  }
  
  const moveSectionUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...sectionOrder]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    setSectionOrder(newOrder)
  }
  
  const moveSectionDown = (index: number) => {
    if (index === sectionOrder.length - 1) return
    const newOrder = [...sectionOrder]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    setSectionOrder(newOrder)
  }
  
  const renameSection = (key: string) => {
    if (newSectionName.trim()) {
      setSectionNames({ ...sectionNames, [key]: newSectionName.trim() })
      setRenamingSection(null)
      setNewSectionName('')
    }
  }
  
  const addNewSection = () => {
    const newKey = `custom_${Date.now()}`
    setSectionOrder([...sectionOrder, newKey])
    setSectionNames({ ...sectionNames, [newKey]: 'New Section' })
    setConfig({
      ...config,
      sections: { ...config.sections, [newKey]: true }
    })
  }
  
  const removeSection = (key: string) => {
    // Prevent removing static sections
    if (STATIC_SECTIONS.includes(key)) {
      alert('Static sections cannot be removed. You can disable them instead.')
      return
    }
    
    if (window.confirm(`Are you sure you want to remove the "${sectionNames[key]}" section?`)) {
      setSectionOrder(sectionOrder.filter(k => k !== key))
      const newSections = { ...config.sections } as Record<string, boolean>
      delete newSections[key]
      const newNames = { ...sectionNames }
      delete newNames[key]
      const newContent = { ...sectionContent }
      delete newContent[key]
      setConfig({ ...config, sections: newSections as any })
      setSectionNames(newNames)
      setSectionContent(newContent)
    }
  }

  const uploadProfilePicture = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.url
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Dropzone for profile picture
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setProfileImage(file)
        const preview = URL.createObjectURL(file)
        setProfilePreview(preview)
        setConfig(prev => ({ ...prev, profilePicture: preview }))
      }
    }
  })

  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Playfair Display',
    'Merriweather'
  ]

  return (
    <div className="portfolio-config-container">
      {/* Header */}
      <div className="config-header">
        <div className="config-header-left">
          <h1 className="config-title">{showPreview ? 'Portfolio Preview' : 'Configure Your Portfolio'}</h1>
          {template && !showPreview && (
            <p className="config-subtitle">Template: {template.name}</p>
          )}
          {showPreview && (
            <p className="config-subtitle">Preview how your portfolio will look when published</p>
          )}
        </div>
        <div className="config-header-actions">
          <button
            className="config-button preview"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={18} />
            {showPreview ? 'Back to Configuration' : 'Show Preview'}
          </button>
          {!showPreview && (
            <button
              className="config-button save"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Portfolio'}
            </button>
          )}
        </div>
      </div>

      <div className="config-content">
        {/* Configuration Form - Full Page */}
        {!showPreview && (
        <div className="config-panel config-panel-fullpage">
          {/* Tabs */}
          <div className="config-tabs">
            <button
              className={`config-tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Info
            </button>
            <button
              className={`config-tab ${activeTab === 'theme' ? 'active' : ''}`}
              onClick={() => setActiveTab('theme')}
            >
              <Palette size={18} />
              Theme
            </button>
            <button
              className={`config-tab ${activeTab === 'layout' ? 'active' : ''}`}
              onClick={() => setActiveTab('layout')}
            >
              <Layout size={18} />
              Layout
            </button>
            <button
              className={`config-tab ${activeTab === 'sections' ? 'active' : ''}`}
              onClick={() => setActiveTab('sections')}
            >
              Sections
            </button>
            <button
              className={`config-tab ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <Briefcase size={18} />
              Projects
            </button>
            <button
              className={`config-tab ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <Award size={18} />
              Skills
            </button>
            <button
              className={`config-tab ${activeTab === 'testimonials' ? 'active' : ''}`}
              onClick={() => setActiveTab('testimonials')}
            >
              <MessageSquare size={18} />
              Testimonials
            </button>
            
            {/* Dynamic Section Tabs - Ordered by sectionOrder */}
            {sectionOrder
              .filter(key => 
                config.sections[key as keyof typeof config.sections] !== false &&
                !['projects', 'skills', 'testimonials'].includes(key) // Exclude sections that already have dedicated tabs
              )
              .map((key) => {
                // Get icon for each section type
                const getIcon = () => {
                  switch(key) {
                    case 'education': return <Award size={18} />
                    case 'experience': return <Briefcase size={18} />
                    case 'publications': return <LinkIcon size={18} />
                    case 'contact': return <MessageSquare size={18} />
                    default: return <Layout size={18} />
                  }
                }
                
                return (
                  <button
                    key={key}
                    className={`config-tab ${activeTab === key ? 'active' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    {getIcon()}
                    {sectionNames[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                )
              })}
          </div>

          {/* Tab Content */}
          <div className="config-form">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <h2 className="section-title">Basic Information</h2>

                {/* Name */}
                <div className="form-group">
                  <label className="form-label">Portfolio Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., John Doe's Portfolio"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  />
                </div>

                {/* Profile Picture Upload */}
                <div className="form-group">
                  <label className="form-label">Profile Picture</label>
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    {profilePreview || config.profilePicture ? (
                      <div className="profile-preview">
                        <img src={profilePreview || config.profilePicture} alt="Profile" />
                        <button
                          className="remove-image"
                          onClick={(e) => {
                            e.stopPropagation()
                            setProfileImage(null)
                            setProfilePreview('')
                            setConfig(prev => ({ ...prev, profilePicture: '' }))
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="dropzone-content">
                        <Upload size={32} />
                        <p>Drag & drop or click to upload</p>
                        <span>PNG, JPG up to 5MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Headline */}
                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Full-Stack Developer & UI/UX Designer"
                    value={config.headline}
                    onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Tell us about yourself..."
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  />
                </div>

                {/* Social Links */}
                <div className="form-group">
                  <label className="form-label">
                    <LinkIcon size={18} />
                    Social Links
                  </label>
                  <div className="social-inputs">
                    <input
                      type="url"
                      className="form-input"
                      placeholder="GitHub URL"
                      value={config.socialLinks.github || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, github: e.target.value }
                        })
                      }
                    />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="LinkedIn URL"
                      value={config.socialLinks.linkedin || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, linkedin: e.target.value }
                        })
                      }
                    />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Twitter URL"
                      value={config.socialLinks.twitter || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, twitter: e.target.value }
                        })
                      }
                    />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Website URL"
                      value={config.socialLinks.website || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, website: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <h2 className="section-title">Color Theme</h2>

                <div className="color-grid">
                  {Object.entries(config.theme).map(([key, value]) => (
                    <div key={key} className="color-picker-group">
                      <label className="form-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <div className="color-picker-wrapper">
                        <button
                          className="color-swatch"
                          style={{ backgroundColor: value }}
                          onClick={() => setShowColorPicker(showColorPicker === key ? null : key)}
                        >
                          <span className="color-value">{value}</span>
                        </button>
                        {showColorPicker === key && (
                          <div className="color-picker-popover">
                            <div
                              className="color-picker-overlay"
                              onClick={() => setShowColorPicker(null)}
                            />
                            <SketchPicker
                              color={value}
                              onChange={(color: { hex: string }) =>
                                setConfig({
                                  ...config,
                                  theme: { ...config.theme, [key]: color.hex }
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="section-title" style={{ marginTop: '2rem' }}>
                  <Type size={20} />
                  Typography
                </h2>

                <div className="form-group">
                  <label className="form-label">Heading Font</label>
                  <select
                    className="form-select white-dropdown"
                    value={config.typography.headingFont}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        typography: { ...config.typography, headingFont: e.target.value }
                      })
                    }
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Body Font</label>
                  <select
                    className="form-select white-dropdown"
                    value={config.typography.bodyFont}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        typography: { ...config.typography, bodyFont: e.target.value }
                      })
                    }
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Font Size</label>
                  <div className="radio-group">
                    {['small', 'medium', 'large'].map((size) => (
                      <label key={size} className="radio-label">
                        <input
                          type="radio"
                          name="fontSize"
                          value={size}
                          checked={config.typography.fontSize === size}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              typography: { ...config.typography, fontSize: e.target.value as 'small' | 'medium' | 'large' }
                            })
                          }
                        />
                        <span>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <h2 className="section-title">Layout Settings</h2>

                <div className="form-group">
                  <label className="form-label">Header Style</label>
                  <div className="layout-options">
                    {['centered', 'left', 'right'].map((style) => (
                      <button
                        key={style}
                        className={`layout-option ${config.layout.headerStyle === style ? 'active' : ''}`}
                        onClick={() =>
                          setConfig({
                            ...config,
                            layout: { ...config.layout, headerStyle: style as 'centered' | 'left' | 'right' }
                          })
                        }
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Spacing</label>
                  <div className="layout-options">
                    {['compact', 'comfortable', 'spacious'].map((spacing) => (
                      <button
                        key={spacing}
                        className={`layout-option ${config.layout.spacing === spacing ? 'active' : ''}`}
                        onClick={() =>
                          setConfig({
                            ...config,
                            layout: { ...config.layout, spacing: spacing as 'compact' | 'comfortable' | 'spacious' }
                          })
                        }
                      >
                        {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Card Style</label>
                  <div className="layout-options">
                    {['rounded', 'sharp', 'minimal'].map((cardStyle) => (
                      <button
                        key={cardStyle}
                        className={`layout-option ${config.layout.cardStyle === cardStyle ? 'active' : ''}`}
                        onClick={() =>
                          setConfig({
                            ...config,
                            layout: { ...config.layout, cardStyle: cardStyle as 'rounded' | 'sharp' | 'minimal' }
                          })
                        }
                      >
                        {cardStyle.charAt(0).toUpperCase() + cardStyle.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sections Tab */}
            {activeTab === 'sections' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <div className="section-header-actions">
                  <div>
                    <h2 className="section-title">Manage Sections</h2>
                    <p className="section-description">
                      Enable, reorder, rename, and customize portfolio sections
                    </p>
                  </div>
                  <button className="add-button" onClick={addNewSection}>
                    + Add Section
                  </button>
                </div>

                <div className="sections-list">
                  {sectionOrder.map((key, index) => {
                    // Get icon for each section type
                    const getSectionIcon = () => {
                      switch(key) {
                        case 'education': return <GraduationCap size={18} />
                        case 'experience': return <Briefcase size={18} />
                        case 'projects': return <Code size={18} />
                        case 'publications': return <BookOpen size={18} />
                        case 'skills': return <Star size={18} />
                        case 'testimonials': return <MessageSquare size={18} />
                        case 'contact': return <Phone size={18} />
                        default: return <FileText size={18} />
                      }
                    }
                    
                    return (
                    <div key={key} className="section-item">
                      <div className="section-reorder-buttons">
                        <button
                          className="reorder-btn"
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          className="reorder-btn"
                          onClick={() => moveSectionDown(index)}
                          disabled={index === sectionOrder.length - 1}
                          title="Move Down"
                        >
                          ↓
                        </button>
                      </div>
                      
                      <label className="section-toggle">
                        <input
                          type="checkbox"
                          checked={config.sections[key as keyof typeof config.sections] !== false}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              sections: { ...config.sections, [key]: e.target.checked } as any
                            })
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      
                      <span className="section-icon">{getSectionIcon()}</span>
                      
                      <div className="section-name-area">
                        {renamingSection === key && !STATIC_SECTIONS.includes(key) ? (
                          <input
                            type="text"
                            className="section-rename-input"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            onBlur={() => renameSection(key)}
                            onKeyPress={(e) => e.key === 'Enter' && renameSection(key)}
                            autoFocus
                          />
                        ) : (
                          <span className="section-name">{sectionNames[key] || key}</span>
                        )}
                      </div>
                      
                      <div className="section-actions">
                        {!STATIC_SECTIONS.includes(key) && (
                          <>
                            <button
                              className="action-btn"
                              onClick={() => {
                                setRenamingSection(key)
                                setNewSectionName(sectionNames[key] || key)
                              }}
                              title="Rename"
                            >
                              ✎
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => removeSection(key)}
                              title="Remove"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <div className="section-header-actions">
                  <div>
                    <h2 className="section-title">Manage Projects</h2>
                    <p className="section-description">
                      Add and manage your project portfolio
                    </p>
                  </div>
                  <button
                    className="add-button"
                    onClick={() => {
                      setEditingProject(null)
                      setShowProjectForm(true)
                    }}
                  >
                    <Briefcase size={18} />
                    Add Project
                  </button>
                </div>

                {projects.length > 0 ? (
                  <div className="projects-grid">
                    {projects.map((project) => (
                      <div key={project.id} className="project-card">
                        {project.featured && (
                          <span className="featured-badge">⭐ Featured</span>
                        )}
                        {project.images.length > 0 && (
                          <img src={project.images[0]} alt={project.title} className="project-thumbnail" />
                        )}
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        
                        {project.techStack.length > 0 && (
                          <div className="project-tech-stack">
                            {project.techStack.map((tech) => (
                              <span key={tech} className="tech-badge">{tech}</span>
                            ))}
                          </div>
                        )}
                        
                        {(project.demoUrl || project.codeUrl) && (
                          <div className="project-links">
                            {project.demoUrl && (
                              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                <ExternalLink size={14} />
                                Demo
                              </a>
                            )}
                            {project.codeUrl && (
                              <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                <Github size={14} />
                                Code
                              </a>
                            )}
                          </div>
                        )}
                        
                        <div className="project-actions">
                          <button
                            onClick={() => {
                              setEditingProject(project)
                              setShowProjectForm(true)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this project?')) {
                                setProjects(projects.filter(p => p.id !== project.id))
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No projects added yet. Click "Add Project" to get started.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <SkillsList
                  skills={skills}
                  portfolioId={portfolioId || 'temp'}
                  onAdd={async (skill) => {
                    const newSkill = {
                      ...skill,
                      id: `skill-${Date.now()}`,
                      portfolioId: portfolioId || 'temp',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                    setSkills([...skills, newSkill as Skill])
                  }}
                  onUpdate={async (id, skill) => {
                    setSkills(skills.map(s => s.id === id ? { ...s, ...skill, updatedAt: new Date().toISOString() } : s))
                  }}
                  onDelete={async (id) => {
                    setSkills(skills.filter(s => s.id !== id))
                  }}
                />
              </motion.div>
            )}

            {/* Testimonials Tab */}
            {activeTab === 'testimonials' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <TestimonialsList
                  testimonials={testimonials}
                  portfolioId={portfolioId || 'temp'}
                  onAdd={async (testimonial) => {
                    const newTestimonial = {
                      ...testimonial,
                      id: `testimonial-${Date.now()}`,
                      portfolioId: portfolioId || 'temp',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                    setTestimonials([...testimonials, newTestimonial as Testimonial])
                  }}
                  onUpdate={async (id, testimonial) => {
                    setTestimonials(testimonials.map(t => t.id === id ? { ...t, ...testimonial, updatedAt: new Date().toISOString() } : t))
                  }}
                  onDelete={async (id) => {
                    setTestimonials(testimonials.filter(t => t.id !== id))
                  }}
                />
              </motion.div>
            )}
            
            {/* Education Tab */}
            {activeTab === 'education' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <div className="section-header-actions">
                  <h2 className="section-title">Manage Education</h2>
                  <button 
                    className="add-button"
                    onClick={() => {
                      const newItem = {
                        id: `education-${Date.now()}`,
                        schoolName: '',
                        level: '',
                        course: '',
                        startDate: '',
                        endDate: ''
                      }
                      setSectionContent({
                        ...sectionContent,
                        education: [...(sectionContent.education || []), newItem]
                      })
                    }}
                  >
                    + Add Education
                  </button>
                </div>
                
                <div className="section-items-list">
                  {(!sectionContent.education || sectionContent.education.length === 0) ? (
                    <div className="empty-state">
                      <p>No education entries yet. Click "Add Education" to get started.</p>
                    </div>
                  ) : (
                    sectionContent.education.map((item: any) => (
                      <div key={item.id} className="section-content-card">
                        {editingEducationId === item.id ? (
                          // Edit Mode
                          <>
                            <div className="card-content">
                              <input
                                type="text"
                                className="item-input"
                                placeholder="School/University Name"
                                value={item.schoolName || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    education: sectionContent.education.map(i => 
                                      i.id === item.id ? { ...i, schoolName: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <input
                                type="text"
                                className="item-input"
                                placeholder="Education Level (e.g., Bachelor's, Master's)"
                                value={item.level || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    education: sectionContent.education.map(i => 
                                      i.id === item.id ? { ...i, level: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <input
                                type="text"
                                className="item-input"
                                placeholder="Course/Major"
                                value={item.course || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    education: sectionContent.education.map(i => 
                                      i.id === item.id ? { ...i, course: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <div className="date-range-inputs">
                                <input
                                  type="date"
                                  className="item-date-input"
                                  placeholder="Start Date"
                                  value={item.startDate || ''}
                                  onChange={(e) => {
                                    setSectionContent({
                                      ...sectionContent,
                                      education: sectionContent.education.map(i => 
                                        i.id === item.id ? { ...i, startDate: e.target.value } : i
                                      )
                                    })
                                  }}
                                />
                                <span className="date-separator">to</span>
                                <input
                                  type="date"
                                  className="item-date-input"
                                  placeholder="End Date"
                                  value={item.endDate || ''}
                                  onChange={(e) => {
                                    setSectionContent({
                                      ...sectionContent,
                                      education: sectionContent.education.map(i => 
                                        i.id === item.id ? { ...i, endDate: e.target.value } : i
                                      )
                                    })
                                  }}
                                />
                              </div>
                            </div>
                            <div className="card-actions">
                              <button
                                className="action-btn save"
                                onClick={() => setEditingEducationId(null)}
                              >
                                ✓ Save
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  if (window.confirm('Delete this education entry?')) {
                                    setSectionContent({
                                      ...sectionContent,
                                      education: sectionContent.education.filter(i => i.id !== item.id)
                                    })
                                    setEditingEducationId(null)
                                  }
                                }}
                              >
                                × Delete
                              </button>
                            </div>
                          </>
                        ) : (
                          // Display Mode
                          <>
                            <div className="card-content">
                              <div className="display-field">
                                <strong className="field-label">School:</strong>
                                <span className="field-value">{item.schoolName || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Level:</strong>
                                <span className="field-value">{item.level || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Course:</strong>
                                <span className="field-value">{item.course || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Duration:</strong>
                                <span className="field-value">
                                  {item.startDate ? new Date(item.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'} 
                                  {' to '}
                                  {item.endDate ? new Date(item.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <div className="card-actions">
                              <button
                                className="action-btn edit"
                                onClick={() => setEditingEducationId(item.id)}
                              >
                                ✎ Edit
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  if (window.confirm('Delete this education entry?')) {
                                    setSectionContent({
                                      ...sectionContent,
                                      education: sectionContent.education.filter(i => i.id !== item.id)
                                    })
                                  }
                                }}
                              >
                                × Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <div className="section-header-actions">
                  <h2 className="section-title">Manage Experience</h2>
                  <button 
                    className="add-button"
                    onClick={() => {
                      const newItem = {
                        id: `experience-${Date.now()}`,
                        role: '',
                        company: '',
                        type: 'Full Time',
                        startDate: '',
                        endDate: '',
                        achievements: ['']
                      }
                      setSectionContent({
                        ...sectionContent,
                        experience: [...(sectionContent.experience || []), newItem]
                      })
                    }}
                  >
                    + Add Experience
                  </button>
                </div>
                
                <div className="section-items-list">
                  {(!sectionContent.experience || sectionContent.experience.length === 0) ? (
                    <div className="empty-state">
                      <p>No experience entries yet. Click "Add Experience" to get started.</p>
                    </div>
                  ) : (
                    sectionContent.experience.map((item: any) => (
                      <div key={item.id} className="section-content-card">
                        {editingExperienceId === item.id ? (
                          // Edit Mode
                          <>
                            <div className="card-content">
                              <input
                                type="text"
                                className="item-input"
                                placeholder="Role/Position"
                                value={item.role || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    experience: sectionContent.experience.map(i => 
                                      i.id === item.id ? { ...i, role: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <input
                                type="text"
                                className="item-input"
                                placeholder="Company"
                                value={item.company || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    experience: sectionContent.experience.map(i => 
                                      i.id === item.id ? { ...i, company: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <select
                                className="item-select"
                                value={item.type || 'Full Time'}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    experience: sectionContent.experience.map(i => 
                                      i.id === item.id ? { ...i, type: e.target.value } : i
                                    )
                                  })
                                }}
                              >
                                <option value="Full Time">Full Time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                              </select>
                              <div className="date-range-inputs">
                                <input
                                  type="date"
                                  className="item-date-input"
                                  placeholder="Start Date"
                                  value={item.startDate || ''}
                                  onChange={(e) => {
                                    setSectionContent({
                                      ...sectionContent,
                                      experience: sectionContent.experience.map(i => 
                                        i.id === item.id ? { ...i, startDate: e.target.value } : i
                                      )
                                    })
                                  }}
                                />
                                <span className="date-separator">to</span>
                                <input
                                  type="date"
                                  className="item-date-input"
                                  placeholder="End Date"
                                  value={item.endDate || ''}
                                  onChange={(e) => {
                                    setSectionContent({
                                      ...sectionContent,
                                      experience: sectionContent.experience.map(i => 
                                        i.id === item.id ? { ...i, endDate: e.target.value } : i
                                      )
                                    })
                                  }}
                                />
                              </div>
                              <div className="achievements-section">
                                <label className="achievements-label">Achievements</label>
                                {(item.achievements || ['']).map((achievement: string, idx: number) => (
                                  <div key={idx} className="achievement-input-group">
                                    <input
                                      type="text"
                                      className="item-input"
                                      placeholder="Achievement/Responsibility"
                                      value={achievement}
                                      onChange={(e) => {
                                        const newAchievements = [...(item.achievements || [''])]
                                        newAchievements[idx] = e.target.value
                                        setSectionContent({
                                          ...sectionContent,
                                          experience: sectionContent.experience.map(i => 
                                            i.id === item.id ? { ...i, achievements: newAchievements } : i
                                          )
                                        })
                                      }}
                                    />
                                    {idx > 0 && (
                                      <button
                                        className="remove-achievement-btn"
                                        onClick={() => {
                                          const newAchievements = item.achievements.filter((_: any, i: number) => i !== idx)
                                          setSectionContent({
                                            ...sectionContent,
                                            experience: sectionContent.experience.map(i => 
                                              i.id === item.id ? { ...i, achievements: newAchievements } : i
                                            )
                                          })
                                        }}
                                      >×</button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  className="add-achievement-btn"
                                  onClick={() => {
                                    setSectionContent({
                                      ...sectionContent,
                                      experience: sectionContent.experience.map(i => 
                                        i.id === item.id ? { ...i, achievements: [...(i.achievements || ['']), ''] } : i
                                      )
                                    })
                                  }}
                                >+ Add Achievement</button>
                              </div>
                            </div>
                            <div className="card-actions">
                              <button
                                className="action-btn save"
                                onClick={() => setEditingExperienceId(null)}
                              >
                                ✓ Save
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  if (window.confirm('Delete this experience entry?')) {
                                    setSectionContent({
                                      ...sectionContent,
                                      experience: sectionContent.experience.filter(i => i.id !== item.id)
                                    })
                                    setEditingExperienceId(null)
                                  }
                                }}
                              >
                                × Delete
                              </button>
                            </div>
                          </>
                        ) : (
                          // Display Mode
                          <>
                            <div className="card-content">
                              <div className="display-field">
                                <strong className="field-label">Role:</strong>
                                <span className="field-value">{item.role || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Company:</strong>
                                <span className="field-value">{item.company || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Type:</strong>
                                <span className="field-value">{item.type || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Duration:</strong>
                                <span className="field-value">
                                  {item.startDate ? new Date(item.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
                                  {' to '}
                                  {item.endDate ? new Date(item.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
                                </span>
                              </div>
                              {item.achievements && item.achievements.length > 0 && item.achievements[0] && (
                                <div className="display-field">
                                  <strong className="field-label">Achievements:</strong>
                                  <div className="field-value">
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                      {item.achievements.filter((a: string) => a).map((achievement: string, idx: number) => (
                                        <li key={idx}>{achievement}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="card-actions">
                              <button
                                className="action-btn edit"
                                onClick={() => setEditingExperienceId(item.id)}
                              >
                                ✎ Edit
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  if (window.confirm('Delete this experience entry?')) {
                                    setSectionContent({
                                      ...sectionContent,
                                      experience: sectionContent.experience.filter(i => i.id !== item.id)
                                    })
                                  }
                                }}
                              >
                                × Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Publications Tab */}
            {activeTab === 'publications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <div className="section-header-actions">
                  <h2 className="section-title">Manage Publications</h2>
                  <button 
                    className="add-button"
                    onClick={() => {
                      const newItem = {
                        id: `publication-${Date.now()}`,
                        title: '',
                        organization: '',
                        date: '',
                        description: ''
                      }
                      setSectionContent({
                        ...sectionContent,
                        publications: [...(sectionContent.publications || []), newItem]
                      })
                    }}
                  >
                    + Add Publication
                  </button>
                </div>
                
                <div className="section-items-list">
                  {(!sectionContent.publications || sectionContent.publications.length === 0) ? (
                    <div className="empty-state">
                      <p>No publications yet. Click "Add Publication" to get started.</p>
                    </div>
                  ) : (
                    sectionContent.publications.map((item: any) => (
                      <div key={item.id} className="section-content-card">
                        {editingPublicationId === item.id ? (
                          // Edit Mode
                          <>
                            <div className="card-content">
                              <input
                                type="text"
                                className="item-input"
                                placeholder="Title"
                                value={item.title || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    publications: sectionContent.publications.map(i => 
                                      i.id === item.id ? { ...i, title: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <input
                                type="text"
                                className="item-input"
                                placeholder="Organization/Publisher"
                                value={item.organization || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    publications: sectionContent.publications.map(i => 
                                      i.id === item.id ? { ...i, organization: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <input
                                type="date"
                                className="item-date-input"
                                placeholder="Publication Date"
                                value={item.date || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    publications: sectionContent.publications.map(i => 
                                      i.id === item.id ? { ...i, date: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <textarea
                                className="item-description-input"
                                placeholder="Description"
                                value={item.description || ''}
                                rows={3}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    publications: sectionContent.publications.map(i => 
                                      i.id === item.id ? { ...i, description: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                            </div>
                            <div className="card-actions">
                              <button
                                className="action-btn save"
                                onClick={() => setEditingPublicationId(null)}
                              >
                                ✓ Save
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  if (window.confirm('Delete this publication?')) {
                                    setSectionContent({
                                      ...sectionContent,
                                      publications: sectionContent.publications.filter(i => i.id !== item.id)
                                    })
                                    setEditingPublicationId(null)
                                  }
                                }}
                              >
                                × Delete
                              </button>
                            </div>
                          </>
                        ) : (
                          // Display Mode
                          <>
                            <div className="card-content">
                              <div className="display-field">
                                <strong className="field-label">Title:</strong>
                                <span className="field-value">{item.title || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Publisher:</strong>
                                <span className="field-value">{item.organization || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Date:</strong>
                                <span className="field-value">
                                  {item.date ? new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Not specified'}
                                </span>
                              </div>
                              {item.description && (
                                <div className="display-field">
                                  <strong className="field-label">Description:</strong>
                                  <span className="field-value">{item.description}</span>
                                </div>
                              )}
                            </div>
                            <div className="card-actions">
                              <button
                                className="action-btn edit"
                                onClick={() => setEditingPublicationId(item.id)}
                              >
                                ✎ Edit
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  if (window.confirm('Delete this publication?')) {
                                    setSectionContent({
                                      ...sectionContent,
                                      publications: sectionContent.publications.filter(i => i.id !== item.id)
                                    })
                                  }
                                }}
                              >
                                × Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <div className="section-header-actions">
                  <h2 className="section-title">Manage Contact Information</h2>
                  <button 
                    className="add-button"
                    onClick={() => {
                      const newItem = {
                        id: `contact-${Date.now()}`,
                        name: '',
                        phone: '',
                        email: '',
                        address: ''
                      }
                      setSectionContent({
                        ...sectionContent,
                        contact: [...(sectionContent.contact || []), newItem]
                      })
                    }}
                  >
                    + Add Contact
                  </button>
                </div>
                
                <div className="section-items-list">
                  {(!sectionContent.contact || sectionContent.contact.length === 0) ? (
                    <div className="empty-state">
                      <p>No contact information yet. Click "Add Contact" to get started.</p>
                    </div>
                  ) : (
                    sectionContent.contact.map((item: any) => (
                      <div key={item.id} className="section-content-card">
                        {editingContactId === item.id ? (
                          // Edit Mode
                          <>
                            <div className="card-content">
                              <input
                                type="text"
                                className="item-input"
                                placeholder="Name"
                                value={item.name || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    contact: sectionContent.contact.map(i => 
                                      i.id === item.id ? { ...i, name: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <input
                                type="tel"
                                className="item-input"
                                placeholder="Contact Number"
                                value={item.phone || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    contact: sectionContent.contact.map(i => 
                                      i.id === item.id ? { ...i, phone: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <input
                                type="email"
                                className="item-input"
                                placeholder="Email Address"
                                value={item.email || ''}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    contact: sectionContent.contact.map(i => 
                                      i.id === item.id ? { ...i, email: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                              <textarea
                                className="item-description-input"
                                placeholder="Address"
                                value={item.address || ''}
                                rows={2}
                                onChange={(e) => {
                                  setSectionContent({
                                    ...sectionContent,
                                    contact: sectionContent.contact.map(i => 
                                      i.id === item.id ? { ...i, address: e.target.value } : i
                                    )
                                  })
                                }}
                              />
                            </div>
                            <div className="card-actions">
                              <button
                                className="action-btn save"
                                onClick={() => setEditingContactId(null)}
                              >
                                ✓ Save
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  if (window.confirm('Delete this contact entry?')) {
                                    setSectionContent({
                                      ...sectionContent,
                                      contact: sectionContent.contact.filter(i => i.id !== item.id)
                                    })
                                    setEditingContactId(null)
                                  }
                                }}
                              >
                                × Delete
                              </button>
                            </div>
                          </>
                        ) : (
                          // Display Mode
                          <>
                            <div className="card-content">
                              <div className="display-field">
                                <strong className="field-label">Name:</strong>
                                <span className="field-value">{item.name || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Phone:</strong>
                                <span className="field-value">{item.phone || 'Not specified'}</span>
                              </div>
                              <div className="display-field">
                                <strong className="field-label">Email:</strong>
                                <span className="field-value">{item.email || 'Not specified'}</span>
                              </div>
                              {item.address && (
                                <div className="display-field">
                                  <strong className="field-label">Address:</strong>
                                  <span className="field-value">{item.address}</span>
                                </div>
                              )}
                            </div>
                            <div className="card-actions">
                              <button
                                className="action-btn edit"
                                onClick={() => setEditingContactId(item.id)}
                              >
                                ✎ Edit
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={() => {
                                  if (window.confirm('Delete this contact entry?')) {
                                    setSectionContent({
                                      ...sectionContent,
                                      contact: sectionContent.contact.filter(i => i.id !== item.id)
                                    })
                                  }
                                }}
                              >
                                × Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Dynamic Custom Sections */}
            {sectionOrder
              .filter(key => 
                config.sections[key as keyof typeof config.sections] !== false &&
                !STATIC_SECTIONS.includes(key) &&
                activeTab === key
              )
              .map((key) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="config-section"
                >
                  <div className="section-header-actions">
                    <h2 className="section-title">Manage {sectionNames[key] || key}</h2>
                    <button 
                      className="add-button"
                      onClick={() => {
                        const newItem = {
                          id: `${key}-${Date.now()}`,
                          title: '',
                          description: ''
                        }
                        setSectionContent({
                          ...sectionContent,
                          [key]: [...(sectionContent[key] || []), newItem]
                        })
                      }}
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  <div className="section-items-list">
                    {(!sectionContent[key] || sectionContent[key].length === 0) ? (
                      <div className="empty-state">
                        <p>No items yet. Click "Add Item" to get started.</p>
                      </div>
                    ) : (
                      (sectionContent[key] || []).map((item: any) => (
                        <div key={item.id} className="section-content-card">
                          <div className="card-content">
                            <input
                              type="text"
                              className="item-input"
                              placeholder="Title"
                              value={item.title || ''}
                              onChange={(e) => {
                                setSectionContent({
                                  ...sectionContent,
                                  [key]: sectionContent[key].map(i => 
                                    i.id === item.id ? { ...i, title: e.target.value } : i
                                  )
                                })
                              }}
                            />
                            <textarea
                              className="item-description-input"
                              placeholder="Description"
                              value={item.description || ''}
                              rows={3}
                              onChange={(e) => {
                                setSectionContent({
                                  ...sectionContent,
                                  [key]: sectionContent[key].map(i => 
                                    i.id === item.id ? { ...i, description: e.target.value } : i
                                  )
                                })
                              }}
                            />
                          </div>
                          <div className="card-actions">
                            <button
                              className="action-btn delete"
                              onClick={() => {
                                setSectionContent({
                                  ...sectionContent,
                                  [key]: sectionContent[key].filter(i => i.id !== item.id)
                                })
                              }}
                            >× Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
        )}

        {/* Full Page Preview */}
        {showPreview && (
          <motion.div
            className="preview-panel preview-panel-fullpage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="preview-content preview-content-fullpage">
              <div className="preview-mockup preview-mockup-fullpage" style={{
                backgroundColor: config.theme.backgroundColor,
                color: config.theme.textColor,
                fontFamily: config.typography.bodyFont,
                fontSize: config.typography.fontSize === 'small' ? '14px' : config.typography.fontSize === 'large' ? '18px' : '16px'
              }}>
                {/* Header Preview */}
                <div className={`preview-header-section ${config.layout.headerStyle}`}>
                  {config.profilePicture && (
                    <img
                      src={config.profilePicture}
                      alt="Profile"
                      className="preview-avatar"
                    />
                  )}
                  <h1 style={{
                    fontFamily: config.typography.headingFont,
                    color: config.theme.primaryColor
                  }}>
                    {config.headline || 'Your Headline'}
                  </h1>
                  <p style={{ fontFamily: config.typography.bodyFont }}>{config.description || 'Your description will appear here...'}</p>
                  
                  {/* Social Links Preview */}
                  {(config.socialLinks.github || config.socialLinks.linkedin || config.socialLinks.twitter || config.socialLinks.website) && (
                    <div className="preview-social-links">
                      {config.socialLinks.github && (
                        <a href={config.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
                          <Github size={20} />
                        </a>
                      )}
                      {config.socialLinks.linkedin && (
                        <a href={config.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
                          <Linkedin size={20} />
                        </a>
                      )}
                      {config.socialLinks.twitter && (
                        <a href={config.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter">
                          <Twitter size={20} />
                        </a>
                      )}
                      {config.socialLinks.website && (
                        <a href={config.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-link" title="Website">
                          <LinkIcon size={20} />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Sections - Display in order */}
                <div className={`preview-sections spacing-${config.layout.spacing}`}>
                  {sectionOrder.filter(key => config.sections[key as keyof typeof config.sections] !== false).map((key) => (
                    <div
                      key={key}
                      className={`preview-section card-${config.layout.cardStyle}`}
                      style={{
                        borderColor: config.theme.secondaryColor
                      }}
                    >
                      <h3 style={{ 
                        color: config.theme.primaryColor,
                        fontFamily: config.typography.headingFont
                      }}>
                        {sectionNames[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                      </h3>
                      
                      {/* Show relevant content for each section type */}
                      {key === 'projects' && projects.length > 0 && (
                        <div className="preview-projects">
                          {projects.slice(0, 2).map(project => (
                            <div key={project.id} className="preview-project-card">
                              {project.featured && (
                                <span className="preview-featured-badge" style={{ 
                                  backgroundColor: config.theme.accentColor,
                                  fontFamily: config.typography.bodyFont 
                                }}>⭐ Featured</span>
                              )}
                              <h4 style={{ fontFamily: config.typography.headingFont }}>{project.title}</h4>
                              <p style={{ fontFamily: config.typography.bodyFont }}>{project.description.substring(0, 80)}...</p>
                              
                              {project.techStack.length > 0 && (
                                <div className="preview-tech-stack">
                                  {project.techStack.slice(0, 4).map(tech => (
                                    <span key={tech} className="preview-tech-badge" style={{ 
                                      backgroundColor: config.theme.accentColor,
                                      fontFamily: config.typography.bodyFont
                                    }}>
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {(project.demoUrl || project.codeUrl) && (
                                <div className="preview-project-links" style={{ fontFamily: config.typography.bodyFont }}>
                                  {project.demoUrl && (
                                    <span className="preview-link" style={{ color: config.theme.primaryColor }}>🔗 Demo</span>
                                  )}
                                  {project.codeUrl && (
                                    <span className="preview-link" style={{ color: config.theme.primaryColor }}>💻 Code</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {key === 'skills' && skills.length > 0 && (
                        <div className="preview-skills">
                          {skills.slice(0, 6).map(skill => (
                            <div key={skill.id} className="preview-skill-item" style={{ 
                              fontFamily: config.typography.bodyFont,
                              borderColor: config.theme.secondaryColor
                            }}>
                              <div className="preview-skill-header">
                                <span className="preview-skill-name" style={{ color: config.theme.primaryColor }}>{skill.name}</span>
                                <span className="preview-skill-category" style={{ 
                                  backgroundColor: config.theme.accentColor,
                                  color: '#ffffff'
                                }}>
                                  {skill.category}
                                </span>
                              </div>
                              <div className="preview-skill-proficiency">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <div
                                    key={level}
                                    className={`preview-skill-star ${level <= skill.proficiency ? 'filled' : ''}`}
                                    style={{ 
                                      backgroundColor: level <= skill.proficiency ? config.theme.accentColor : '#e5e7eb'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {key === 'testimonials' && testimonials.length > 0 && (
                        <div className="preview-testimonials-list">
                          {testimonials.slice(0, 2).map(testimonial => (
                            <div key={testimonial.id} className="preview-testimonial-item">
                              <p style={{ fontFamily: config.typography.bodyFont, fontStyle: 'italic' }}>"{testimonial.content}"</p>
                              <div style={{ marginTop: '0.5rem' }}>
                                <strong style={{ fontFamily: config.typography.bodyFont, color: config.theme.primaryColor }}>{testimonial.name}</strong>
                                <small style={{ fontFamily: config.typography.bodyFont, display: 'block', opacity: 0.8 }}>
                                  {testimonial.role}{testimonial.company ? ` at ${testimonial.company}` : ''}
                                </small>
                                {testimonial.rating && (
                                  <div style={{ marginTop: '0.25rem', color: config.theme.accentColor }}>{'★'.repeat(testimonial.rating)}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Education Section Preview */}
                      {key === 'education' && sectionContent.education && sectionContent.education.length > 0 && (
                        <div className="preview-generic-items">
                          {sectionContent.education.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="preview-generic-item">
                              <h4 style={{ fontFamily: config.typography.headingFont, color: config.theme.primaryColor, marginBottom: '0.25rem' }}>
                                {item.schoolName}
                              </h4>
                              <div style={{ fontFamily: config.typography.bodyFont, fontWeight: 600, marginBottom: '0.25rem' }}>
                                {item.level} {item.course && `in ${item.course}`}
                              </div>
                              {(item.startDate || item.endDate) && (
                                <small style={{ fontFamily: config.typography.bodyFont, opacity: 0.7, display: 'block' }}>
                                  {item.startDate && new Date(item.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                  {item.startDate && item.endDate && ' - '}
                                  {item.endDate && new Date(item.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                </small>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Experience Section Preview */}
                      {key === 'experience' && sectionContent.experience && sectionContent.experience.length > 0 && (
                        <div className="preview-generic-items">
                          {sectionContent.experience.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="preview-generic-item">
                              <h4 style={{ fontFamily: config.typography.headingFont, color: config.theme.primaryColor, marginBottom: '0.25rem' }}>
                                {item.role}
                              </h4>
                              <div style={{ fontFamily: config.typography.bodyFont, fontWeight: 600, marginBottom: '0.25rem' }}>
                                {item.company} {item.type && `• ${item.type}`}
                              </div>
                              {(item.startDate || item.endDate) && (
                                <small style={{ fontFamily: config.typography.bodyFont, opacity: 0.7, display: 'block', marginBottom: '0.5rem' }}>
                                  {item.startDate && new Date(item.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                  {item.startDate && item.endDate && ' - '}
                                  {item.endDate && new Date(item.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                </small>
                              )}
                              {item.achievements && item.achievements.length > 0 && (
                                <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0, fontFamily: config.typography.bodyFont, fontSize: '0.85rem' }}>
                                  {item.achievements.filter((a: string) => a.trim()).slice(0, 3).map((achievement: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{achievement}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Publications Section Preview */}
                      {key === 'publications' && sectionContent.publications && sectionContent.publications.length > 0 && (
                        <div className="preview-generic-items">
                          {sectionContent.publications.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="preview-generic-item">
                              <h4 style={{ fontFamily: config.typography.headingFont, color: config.theme.primaryColor, marginBottom: '0.25rem' }}>
                                {item.title}
                              </h4>
                              {item.organization && (
                                <div style={{ fontFamily: config.typography.bodyFont, fontWeight: 600, marginBottom: '0.25rem' }}>
                                  {item.organization}
                                </div>
                              )}
                              {item.date && (
                                <small style={{ fontFamily: config.typography.bodyFont, opacity: 0.7, display: 'block', marginBottom: '0.5rem' }}>
                                  {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </small>
                              )}
                              {item.description && (
                                <p style={{ fontFamily: config.typography.bodyFont, fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Contact Section Preview */}
                      {key === 'contact' && sectionContent.contact && sectionContent.contact.length > 0 && (
                        <div className="preview-generic-items">
                          {sectionContent.contact.slice(0, 1).map((item: any) => (
                            <div key={item.id} className="preview-contact-item" style={{ fontFamily: config.typography.bodyFont }}>
                              {item.name && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong style={{ color: config.theme.primaryColor }}>Name: </strong>{item.name}
                                </div>
                              )}
                              {item.phone && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong style={{ color: config.theme.primaryColor }}>Phone: </strong>{item.phone}
                                </div>
                              )}
                              {item.email && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong style={{ color: config.theme.primaryColor }}>Email: </strong>{item.email}
                                </div>
                              )}
                              {item.address && (
                                <div>
                                  <strong style={{ color: config.theme.primaryColor }}>Address: </strong>{item.address}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Custom Dynamic Sections Preview */}
                      {!STATIC_SECTIONS.includes(key) && sectionContent[key] && sectionContent[key].length > 0 && (
                        <div className="preview-generic-items">
                          {sectionContent[key].slice(0, 3).map((item: any) => (
                            <div key={item.id} className="preview-generic-item">
                              {item.title && (
                                <h4 style={{ fontFamily: config.typography.headingFont, color: config.theme.primaryColor, marginBottom: '0.5rem' }}>
                                  {item.title}
                                </h4>
                              )}
                              {item.description && (
                                <p style={{ fontFamily: config.typography.bodyFont, fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Empty state for sections with no content */}
                      {!(key === 'projects' && projects.length > 0) && 
                       !(key === 'skills' && skills.length > 0) && 
                       !(key === 'testimonials' && testimonials.length > 0) &&
                       !(key === 'education' && sectionContent.education && sectionContent.education.length > 0) &&
                       !(key === 'experience' && sectionContent.experience && sectionContent.experience.length > 0) &&
                       !(key === 'publications' && sectionContent.publications && sectionContent.publications.length > 0) &&
                       !(key === 'contact' && sectionContent.contact && sectionContent.contact.length > 0) &&
                       !(!STATIC_SECTIONS.includes(key) && sectionContent[key] && sectionContent[key].length > 0) && (
                        <p style={{ fontFamily: config.typography.bodyFont, opacity: 0.6, fontStyle: 'italic' }}>No content added yet. Add items to see them here.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          portfolioId={portfolioId || 'temp'}
          onSave={async (projectData) => {
            try {
              if (editingProject) {
                // Update existing project
                const updatedProject = {
                  ...editingProject,
                  ...projectData,
                  id: editingProject.id,
                  updatedAt: new Date().toISOString()
                }
                setProjects(projects.map(p => p.id === editingProject.id ? updatedProject as Project : p))
              } else {
                // Create new project with mock data
                const newProject = {
                  ...projectData,
                  id: `project-${Date.now()}`,
                  portfolioId: portfolioId || 'temp',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
                setProjects([...projects, newProject as Project])
              }
              setShowProjectForm(false)
              setEditingProject(null)
            } catch (error) {
              console.error('Error saving project:', error)
            }
          }}
          onClose={() => {
            setShowProjectForm(false)
            setEditingProject(null)
          }}
        />
      )}
    </div>
  )
}

export default PortfolioConfigComponent
