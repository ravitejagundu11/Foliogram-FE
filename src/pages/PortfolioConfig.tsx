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
  MessageSquare
} from 'lucide-react'
import '../styles/PortfolioConfig.css'

const PortfolioConfigComponent = () => {
  const { templateId } = useParams<{ templateId: string }>()
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [config, setConfig] = useState<PortfolioConfig>({
    templateId: templateId || '',
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
      about: true,
      experience: true,
      education: true,
      projects: true,
      skills: true,
      contact: true
    },
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      website: ''
    }
  })

  const [activeTab, setActiveTab] = useState<'basic' | 'theme' | 'layout' | 'sections' | 'projects' | 'skills' | 'testimonials'>('basic')
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  // New state for projects, skills, testimonials
  const [portfolioId, setPortfolioId] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

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
        profilePictureUrl = await uploadProfilePicture(profileImage)
      }

      const portfolioData = {
        ...config,
        profilePicture: profilePictureUrl
      }

      // Check if updating existing or creating new
      if (config.id) {
        await apiClient.put(`/portfolios/${config.id}`, portfolioData)
        setPortfolioId(config.id)
      } else {
        const response = await apiClient.post<{ id: string }>('/portfolios', portfolioData)
        setConfig(prev => ({ ...prev, id: response.id }))
        setPortfolioId(response.id)
      }

      alert('Portfolio saved successfully!')
    } catch (error) {
      console.error('Error saving portfolio:', error)
      alert('Failed to save portfolio. Please try again.')
    } finally {
      setSaving(false)
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
          <h1 className="config-title">Configure Your Portfolio</h1>
          {template && (
            <p className="config-subtitle">Template: {template.name}</p>
          )}
        </div>
        <div className="config-header-actions">
          <button
            className="config-button preview"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={18} />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            className="config-button save"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Portfolio'}
          </button>
        </div>
      </div>

      <div className="config-content">
        {/* Left Panel - Configuration Form */}
        <div className="config-panel">
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
                    className="form-select"
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
                    className="form-select"
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
                <h2 className="section-title">Enable/Disable Sections</h2>
                <p className="section-description">
                  Choose which sections to display in your portfolio
                </p>

                <div className="sections-grid">
                  {Object.entries(config.sections).map(([key, value]) => (
                    <label key={key} className="section-toggle">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            sections: { ...config.sections, [key]: e.target.checked }
                          })
                        }
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </label>
                  ))}
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

                {portfolioId && projects.length > 0 ? (
                  <div className="projects-grid">
                    {projects.map((project) => (
                      <div key={project.id} className="project-card">
                        {project.images.length > 0 && (
                          <img src={project.images[0]} alt={project.title} className="project-thumbnail" />
                        )}
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
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
                            onClick={async () => {
                              if (window.confirm('Delete this project?')) {
                                await projectApi.delete(portfolioId, project.id!)
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
                <h2 className="section-title">Manage Skills</h2>
                <p className="section-description">
                  Add your technical and professional skills
                </p>

                {portfolioId && (
                  <SkillsList
                    skills={skills}
                    portfolioId={portfolioId}
                    onAdd={async (skill) => {
                      const newSkill = await skillApi.create(portfolioId, skill)
                      setSkills([...skills, newSkill as Skill])
                    }}
                    onUpdate={async (id, skill) => {
                      await skillApi.update(portfolioId, id, skill)
                      setSkills(skills.map(s => s.id === id ? { ...s, ...skill } : s))
                    }}
                    onDelete={async (id) => {
                      await skillApi.delete(portfolioId, id)
                      setSkills(skills.filter(s => s.id !== id))
                    }}
                  />
                )}
              </motion.div>
            )}

            {/* Testimonials Tab */}
            {activeTab === 'testimonials' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="config-section"
              >
                <h2 className="section-title">Manage Testimonials</h2>
                <p className="section-description">
                  Add testimonials from clients and colleagues
                </p>

                {portfolioId && (
                  <TestimonialsList
                    testimonials={testimonials}
                    portfolioId={portfolioId}
                    onAdd={async (testimonial) => {
                      const newTestimonial = await testimonialApi.create(portfolioId, testimonial)
                      setTestimonials([...testimonials, newTestimonial as Testimonial])
                    }}
                    onUpdate={async (id, testimonial) => {
                      await testimonialApi.update(portfolioId, id, testimonial)
                      setTestimonials(testimonials.map(t => t.id === id ? { ...t, ...testimonial } : t))
                    }}
                    onDelete={async (id) => {
                      await testimonialApi.delete(portfolioId, id)
                      setTestimonials(testimonials.filter(t => t.id !== id))
                    }}
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        {showPreview && (
          <motion.div
            className="preview-panel"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
          >
            <div className="preview-header">
              <h3>Live Preview</h3>
              <p>See how your portfolio looks</p>
            </div>
            <div className="preview-content">
              <div className="preview-mockup" style={{
                backgroundColor: config.theme.backgroundColor,
                color: config.theme.textColor,
                fontFamily: config.typography.bodyFont
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
                  <p>{config.description || 'Your description will appear here...'}</p>
                </div>

                {/* Content Sections */}
                <div className={`preview-sections spacing-${config.layout.spacing}`}>
                  {Object.entries(config.sections).map(([key, enabled]) =>
                    enabled ? (
                      <div
                        key={key}
                        className={`preview-section card-${config.layout.cardStyle}`}
                        style={{
                          borderColor: config.theme.secondaryColor
                        }}
                      >
                        <h3 style={{ color: config.theme.primaryColor }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h3>
                        <p>Section content preview...</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && portfolioId && (
        <ProjectForm
          project={editingProject}
          portfolioId={portfolioId}
          onSave={async (project) => {
            if (editingProject) {
              const updated = await projectApi.update(portfolioId, editingProject.id!, project)
              setProjects(projects.map(p => p.id === editingProject.id ? updated as Project : p))
            } else {
              const newProject = await projectApi.create(portfolioId, project)
              setProjects([...projects, newProject as Project])
            }
            setShowProjectForm(false)
            setEditingProject(null)
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
