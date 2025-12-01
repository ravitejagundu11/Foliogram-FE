import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import type { Skill } from '../types/portfolio'
import '../styles/SkillsList.css'

interface SkillsListProps {
  skills: Skill[]
  portfolioId: string
  showForm?: boolean
  onToggleForm?: (show: boolean) => void
  onAdd: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdate: (id: string, skill: Partial<Skill>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Other'] as const

const SkillsList = ({ skills, portfolioId, showForm = false, onToggleForm, onAdd, onUpdate, onDelete }: SkillsListProps) => {
  const [showAddForm, setShowAddForm] = useState(showForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    category: typeof CATEGORIES[number]
    proficiency: 1 | 2 | 3 | 4 | 5
  }>({
    name: '',
    category: 'Frontend',
    proficiency: 3
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  const handleSubmit = async () => {
    if (!formData.name.trim()) return

    try {
      if (editingId) {
        await onUpdate(editingId, formData)
        setEditingId(null)
      } else {
        await onAdd({
          ...formData,
          portfolioId,
          order: skills.length
        })
        setShowAddForm(false)
      }
      setFormData({ name: '', category: 'Frontend', proficiency: 3 })
    } catch (error) {
      console.error('Error saving skill:', error)
    }
  }

  const handleEdit = (skill: Skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency
    })
    setEditingId(skill.id!)
    setShowAddForm(false)
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await onDelete(id)
        setDeleteConfirm(null)
      } catch (error) {
        console.error('Error deleting skill:', error)
      }
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ name: '', category: 'Frontend', proficiency: 3 })
  }

  const renderProficiency = (level: number) => {
    return (
      <div className="proficiency-indicator">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`star ${star <= level ? 'filled' : ''}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="skills-list-container">
      {/* Header with Add Button */}
      <div className="section-header-actions">
        <div>
          <h2 className="section-title">Manage Skills</h2>
          <p className="section-description">
            Add your technical and professional skills
          </p>
        </div>
        {!showAddForm && !editingId && (
          <button
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={18} />
            Add Skill
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingId) && (
          <motion.div
            className="skill-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="skill-form-content">
              <div className="form-row">
                <input
                  type="text"
                  className="skill-input"
                  placeholder="Skill name (e.g., React, Node.js)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit()
                    }
                  }}
                  autoFocus
                />

                <select
                  className="skill-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof CATEGORIES[number] })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="proficiency-selector">
                <label>Proficiency Level:</label>
                <div className="proficiency-buttons">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`prof-button ${formData.proficiency >= level ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, proficiency: level as 1 | 2 | 3 | 4 | 5 })}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={handleCancel}>
                  <X size={16} />
                  Cancel
                </button>
                <button className="btn-save" onClick={handleSubmit}>
                  <Check size={16} />
                  {editingId ? 'Update' : 'Add'} Skill
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills by Category */}
      <div className="skills-categories">
        {CATEGORIES.map((category) => {
          const categorySkills = groupedSkills[category] || []
          if (categorySkills.length === 0) return null

          return (
            <div key={category} className="skill-category">
              <h3 className="category-title">
                {category}
                <span className="category-count">{categorySkills.length}</span>
              </h3>

              <div className="skills-grid">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`skill-chip ${editingId === skill.id ? 'editing' : ''}`}
                  >
                    <div className="skill-info">
                      <span className="skill-name">{skill.name}</span>
                      {renderProficiency(skill.proficiency)}
                    </div>

                    <div className="skill-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(skill)}
                        title="Edit skill"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`action-btn delete ${deleteConfirm === skill.id ? 'confirm' : ''}`}
                        onClick={() => handleDelete(skill.id!)}
                        title={deleteConfirm === skill.id ? 'Click again to confirm' : 'Delete skill'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {skills.length === 0 && !showAddForm && (
        <div className="empty-state">
          <p>No skills added yet</p>
          <span>Start by adding your first skill</span>
        </div>
      )}
    </div>
  )
}

export default SkillsList
