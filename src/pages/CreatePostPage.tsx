import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBlog } from '@contexts/BlogContext'
import { useUserManagement } from '@contexts/UserManagementContext'
import { useAuth } from '@contexts/AuthContext'
import '../styles/CreatePostPage.css'

const CreatePostPage = () => {
  const navigate = useNavigate()
  const { createPost } = useBlog()
  const { users } = useUserManagement()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [taggedUsers, setTaggedUsers] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select valid image files')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setImages((prev) => [...prev, imageData])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('video/')) {
        setError('Please select valid video files')
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        setError('Video size must be less than 50MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const videoData = event.target?.result as string
        setVideos((prev) => [...prev, videoData])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleUserTag = (username: string) => {
    setTaggedUsers((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    if (!content.trim()) {
      setError('Please enter content')
      return
    }

    const postId = createPost({
      title: title.trim(),
      content: content.trim(),
      taggedUsers,
      images,
      videos,
    })

    navigate(`/blog/${postId}`)
  }

  const availableUsers = users.filter((u) => u.username !== user?.username)

  return (
    <div className="create-post-container">
      <div className="create-post-card">
        <h1 className="create-post-title">Create New Post</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your ideas or work..."
              className="form-textarea"
              rows={8}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tag Users</label>
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="tag-users-button"
            >
              {taggedUsers.length === 0 ? 'Tag users' : `${taggedUsers.length} user(s) tagged`}
            </button>

            {showUserDropdown && (
              <div className="user-dropdown">
                {availableUsers.map((u) => (
                  <label key={u.username} className="user-checkbox-label">
                    <input
                      type="checkbox"
                      checked={taggedUsers.includes(u.username)}
                      onChange={() => toggleUserTag(u.username)}
                      className="user-checkbox"
                    />
                    <span>
                      {u.firstName} {u.lastName} (@{u.username})
                    </span>
                  </label>
                ))}
              </div>
            )}

            {taggedUsers.length > 0 && (
              <div className="tagged-users-list">
                {taggedUsers.map((username) => {
                  const taggedUser = users.find((u) => u.username === username)
                  return (
                    <span key={username} className="tagged-user-badge">
                      @{taggedUser?.username}
                      <button type="button" onClick={() => toggleUserTag(username)} className="remove-tag">
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Images</label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="file-input"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="upload-button"
            >
              Upload Images
            </button>

            {images.length > 0 && (
              <div className="media-preview-grid">
                {images.map((img, idx) => (
                  <div key={idx} className="media-preview-item">
                    <img src={img} alt={`Preview ${idx + 1}`} className="preview-image" />
                    <button type="button" onClick={() => removeImage(idx)} className="remove-media">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Videos</label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoUpload}
              className="file-input"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="upload-button"
            >
              Upload Videos
            </button>

            {videos.length > 0 && (
              <div className="media-preview-grid">
                {videos.map((vid, idx) => (
                  <div key={idx} className="media-preview-item">
                    <video src={vid} className="preview-video" controls />
                    <button type="button" onClick={() => removeVideo(idx)} className="remove-media">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/blog')} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-publish">
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostPage
