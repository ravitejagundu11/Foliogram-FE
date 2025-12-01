import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Trash2, Plus, ExternalLink, Github } from 'lucide-react'
import type { Project } from '../types/portfolio'
import '../styles/ProjectForm.css'

interface ProjectFormProps {
  project?: Project | null
  portfolioId: string
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
}

const ProjectForm = ({ project, portfolioId, onSave, onClose }: ProjectFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: [] as string[],
    images: [] as string[],
    demoUrl: '',
    codeUrl: '',
    featured: false,
    order: 0
  })
  const [currentTech, setCurrentTech] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        images: project.images,
        demoUrl: project.demoUrl || '',
        codeUrl: project.codeUrl || '',
        featured: project.featured,
        order: project.order
      })
      setImagePreviews(project.images)
    }
  }, [project])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      const newFiles = [...imageFiles, ...acceptedFiles].slice(0, 5)
      setImageFiles(newFiles)
      
      const previews = newFiles.map(file => URL.createObjectURL(file))
      setImagePreviews([...formData.images, ...previews])
    }
  })

  const handleAddTech = () => {
    if (currentTech.trim() && !formData.techStack.includes(currentTech.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, currentTech.trim()]
      })
      setCurrentTech('')
    }
  }

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter(t => t !== tech)
    })
  }

  const handleRemoveImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newImages = formData.images.filter((_, i) => i !== index)
    const newFiles = imageFiles.filter((_, i) => i !== (index - formData.images.length))
    
    setImagePreviews(newPreviews)
    setFormData({ ...formData, images: newImages })
    setImageFiles(newFiles)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setSaving(true)
    try {
      const projectData = {
        ...formData,
        portfolioId,
        images: imagePreviews
      }

      await onSave(projectData)
      onClose()
    } catch (error) {
      console.error('Error saving project:', error)
      setErrors({ submit: 'Failed to save project. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="project-form-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="project-form-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="project-form-header">
            <h2>{project ? 'Edit Project' : 'Add New Project'}</h2>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="project-form-content">
            {errors.submit && (
              <div className="form-error-message">{errors.submit}</div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Project Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g., E-commerce Platform"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                rows={4}
                placeholder="Describe your project, what it does, and your role..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            {/* Tech Stack */}
            <div className="form-group">
              <label className="form-label">
                Tech Stack <span className="required">*</span>
              </label>
              <div className="tech-stack-input">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., React, Node.js, MongoDB"
                  value={currentTech}
                  onChange={(e) => setCurrentTech(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTech()
                    }
                  }}
                />
                <button
                  type="button"
                  className="add-tech-button"
                  onClick={handleAddTech}
                >
                  <Plus size={20} />
                </button>
              </div>
              {errors.techStack && <span className="error-text">{errors.techStack}</span>}
              
              {/* Tech Stack Chips */}
              <div className="tech-stack-chips">
                {formData.techStack.map((tech) => (
                  <div key={tech} className="tech-chip">
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="remove-chip"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Images */}
            <div className="form-group">
              <label className="form-label">Project Images (Up to 5)</label>
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <Upload size={32} />
                <p>Drag & drop images or click to browse</p>
                <span>PNG, JPG, WebP up to 5MB each</span>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URLs */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <ExternalLink size={16} />
                  Demo URL
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://demo.example.com"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Github size={16} />
                  Code URL
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/username/repo"
                  value={formData.codeUrl}
                  onChange={(e) => setFormData({ ...formData, codeUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span>Mark as featured project</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : project ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProjectForm
