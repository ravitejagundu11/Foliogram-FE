import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Star } from 'lucide-react'
import type { Testimonial } from '../types/portfolio'
import '../styles/TestimonialsList.css'

interface TestimonialsListProps {
  testimonials: Testimonial[]
  portfolioId: string
  onAdd: (testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdate: (id: string, testimonial: Partial<Testimonial>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const TestimonialsList = ({ testimonials, portfolioId, onAdd, onUpdate, onDelete }: TestimonialsListProps) => {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    content: '',
    avatar: '',
    rating: 5
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        company: testimonial.company || '',
        content: testimonial.content,
        avatar: testimonial.avatar || '',
        rating: testimonial.rating || 5
      })
      setEditingId(testimonial.id!)
    } else {
      setFormData({
        name: '',
        role: '',
        company: '',
        content: '',
        avatar: '',
        rating: 5
      })
      setEditingId(null)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      name: '',
      role: '',
      company: '',
      content: '',
      avatar: '',
      rating: 5
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.content.trim()) {
      return
    }

    try {
      if (editingId) {
        await onUpdate(editingId, formData)
      } else {
        await onAdd({
          ...formData,
          portfolioId,
          order: testimonials.length
        })
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving testimonial:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await onDelete(id)
        setDeleteConfirm(null)
      } catch (error) {
        console.error('Error deleting testimonial:', error)
      }
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'filled' : 'empty'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="testimonials-list-container">
      {/* Header with Add Button */}
      <div className="section-header-actions">
        <div>
          <h2 className="section-title">Manage Testimonials</h2>
          <p className="section-description">
            Add testimonials from clients and colleagues
          </p>
        </div>
        <button
          className="add-button"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          Add Testimonial
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            className="testimonial-card"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header */}
            <div className="testimonial-header">
              <div className="avatar-section">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="testimonial-info">
                  <h4 className="testimonial-name">{testimonial.name}</h4>
                  <p className="testimonial-role">
                    {testimonial.role}
                    {testimonial.company && ` at ${testimonial.company}`}
                  </p>
                </div>
              </div>

              {renderStars(testimonial.rating || 5)}
            </div>

            {/* Content */}
            <div className="testimonial-content">
              <p>"{testimonial.content}"</p>
            </div>

            {/* Actions */}
            <div className="testimonial-actions">
              <button
                className="action-btn edit"
                onClick={() => handleOpenModal(testimonial)}
                title="Edit testimonial"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                className={`action-btn delete ${deleteConfirm === testimonial.id ? 'confirm' : ''}`}
                onClick={() => handleDelete(testimonial.id!)}
                title={deleteConfirm === testimonial.id ? 'Click again to confirm' : 'Delete testimonial'}
              >
                <Trash2 size={16} />
                {deleteConfirm === testimonial.id ? 'Confirm?' : 'Delete'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {testimonials.length === 0 && (
        <div className="empty-state">
          <p>No testimonials added yet</p>
          <span>Add testimonials from your clients or colleagues</span>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="testimonial-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="testimonial-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="modal-header">
                <h2>{editingId ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
                <button className="close-button" onClick={handleCloseModal}>
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="CEO"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Company Inc."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Avatar URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Testimonial <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Write the testimonial content..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-button ${star <= formData.rating ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, rating: star })}
                      >
                        <Star size={24} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button primary"
                  >
                    {editingId ? 'Update' : 'Add'} Testimonial
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TestimonialsList
