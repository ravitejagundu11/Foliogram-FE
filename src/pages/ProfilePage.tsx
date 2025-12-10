import { useState, useRef } from 'react'
import { useAuth } from '@contexts/AuthContext'
import { authApi } from '@services/api'
import '../styles/ProfilePage.css'

const ProfilePage = () => {
  const { user, updateUser, setProfileImage } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Profile Form State
  const [editProfile, setEditProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    contactNumber: user?.contactNumber || '',
  })
  const [editProfileError, setEditProfileError] = useState('')
  const [editProfileSuccess, setEditProfileSuccess] = useState('')

  // Change Username Form State
  const [changeUsername, setChangeUsername] = useState({
    newUsername: '',
    currentPassword: '',
  })
  const [changeUsernameError, setChangeUsernameError] = useState('')
  const [changeUsernameSuccess, setChangeUsernameSuccess] = useState('')

  // Reset Password Form State
  const [resetPassword, setResetPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [resetPasswordError, setResetPasswordError] = useState('')
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState('')

  // Profile Image State
  const [profileImage, setProfileImageState] = useState(user?.profileImage || '')
  const [imageError, setImageError] = useState('')

  // Handle Edit Profile
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditProfileError('')
    setEditProfileSuccess('')

    if (!editProfile.firstName.trim() || !editProfile.lastName.trim() || !editProfile.contactNumber.trim()) {
      setEditProfileError('Please fill in all fields')
      return
    }

    try {
      await authApi.updateProfile({
        full_name: `${editProfile.firstName} ${editProfile.lastName}`,
        mobile: editProfile.contactNumber,
      })

      updateUser({
        firstName: editProfile.firstName,
        lastName: editProfile.lastName,
        contactNumber: editProfile.contactNumber,
      })

      setEditProfileSuccess('Profile updated successfully!')
      setTimeout(() => setEditProfileSuccess(''), 3000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.full_name ||
                          error.response?.data?.errors?.mobile ||
                          error.response?.data?.errors?.message ||
                          'Failed to update profile. Please try again.'
      setEditProfileError(errorMessage)
    }
  }

  // Handle Change Username
  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangeUsernameError('')
    setChangeUsernameSuccess('')

    if (!changeUsername.newUsername.trim() || !changeUsername.currentPassword.trim()) {
      setChangeUsernameError('Please fill in all fields')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(changeUsername.newUsername)) {
      setChangeUsernameError('Please enter a valid email address')
      return
    }

    try {
      const response = await authApi.updateProfile({
        email: changeUsername.newUsername,
        current_password: changeUsername.currentPassword,
      })

      // Update token if provided
      if (response.token) {
        localStorage.setItem('token', response.token)
      }

      setChangeUsername({ newUsername: '', currentPassword: '' })
      setChangeUsernameSuccess('Email changed successfully!')
      setTimeout(() => setChangeUsernameSuccess(''), 3000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.current_password || 
                          error.response?.data?.errors?.email ||
                          error.response?.data?.errors?.message ||
                          'Failed to change email. Please try again.'
      setChangeUsernameError(errorMessage)
    }
  }

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetPasswordError('')
    setResetPasswordSuccess('')

    if (!resetPassword.currentPassword.trim() || !resetPassword.newPassword.trim() || !resetPassword.confirmPassword.trim()) {
      setResetPasswordError('Please fill in all fields')
      return
    }

    if (resetPassword.newPassword !== resetPassword.confirmPassword) {
      setResetPasswordError('New passwords do not match')
      return
    }

    if (resetPassword.newPassword.length < 8) {
      setResetPasswordError('Password must be at least 8 characters')
      return
    }

    try {
      await authApi.changePassword({
        current_password: resetPassword.currentPassword,
        new_password: resetPassword.newPassword,
      })

      setResetPassword({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setResetPasswordSuccess('Password changed successfully!')
      setTimeout(() => setResetPasswordSuccess(''), 3000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.current_password || 
                          error.response?.data?.errors?.new_password ||
                          error.response?.data?.errors?.message ||
                          'Failed to change password. Please try again.'
      setResetPasswordError(errorMessage)
    }
  }

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError('')

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setProfileImageState(imageData)
      setProfileImage(imageData)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header" />

        <div className="px-6 pb-6">
          {/* Profile Avatar and Basic Info */}
          <div className="flex items-end -mt-16 mb-6 gap-6">
            <div className="profile-avatar">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600">@{user?.username}</p>
            </div>
          </div>

          {/* Upload Profile Image */}
          <div className="profile-section">
            <h2 className="profile-section-title">Profile Image</h2>
            <div className="image-upload-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="upload-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="upload-button"
              >
                Upload Profile Image
              </button>
              {imageError && <p className="error-text">{imageError}</p>}
            </div>
          </div>

          {/* Edit Profile Information */}
          <div className="profile-section">
            <h2 className="profile-section-title">Edit Profile</h2>
            <form onSubmit={handleEditProfile}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    value={editProfile.firstName}
                    onChange={(e) => setEditProfile({ ...editProfile, firstName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    value={editProfile.lastName}
                    onChange={(e) => setEditProfile({ ...editProfile, lastName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-grid mt-6">
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    value={editProfile.contactNumber}
                    onChange={(e) => setEditProfile({ ...editProfile, contactNumber: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              {editProfileError && <p className="error-text">{editProfileError}</p>}
              {editProfileSuccess && <p className="success-text">{editProfileSuccess}</p>}
              <button type="submit" className="btn-primary mt-6">
                Save Changes
              </button>
            </form>
          </div>

          {/* Change Email */}
          <div className="profile-section">
            <h2 className="profile-section-title">Change Email</h2>
            <form onSubmit={handleChangeUsername}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">New Email</label>
                  <input
                    type="email"
                    value={changeUsername.newUsername}
                    onChange={(e) => setChangeUsername({ ...changeUsername, newUsername: e.target.value })}
                    className="form-input"
                    placeholder="Enter new email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={changeUsername.currentPassword}
                    onChange={(e) => setChangeUsername({ ...changeUsername, currentPassword: e.target.value })}
                    className="form-input"
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>
              {changeUsernameError && <p className="error-text">{changeUsernameError}</p>}
              {changeUsernameSuccess && <p className="success-text">{changeUsernameSuccess}</p>}
              <button type="submit" className="btn-primary mt-6">
                Change Email
              </button>
            </form>
          </div>

          {/* Reset Password */}
          <div className="profile-section">
            <h2 className="profile-section-title">Reset Password</h2>
            <form onSubmit={handleResetPassword}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={resetPassword.currentPassword}
                    onChange={(e) => setResetPassword({ ...resetPassword, currentPassword: e.target.value })}
                    className="form-input"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={resetPassword.newPassword}
                    onChange={(e) => setResetPassword({ ...resetPassword, newPassword: e.target.value })}
                    className="form-input"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>
              <div className="form-grid mt-6">
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={resetPassword.confirmPassword}
                    onChange={(e) => setResetPassword({ ...resetPassword, confirmPassword: e.target.value })}
                    className="form-input"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>
              {resetPasswordError && <p className="error-text">{resetPasswordError}</p>}
              {resetPasswordSuccess && <p className="success-text">{resetPasswordSuccess}</p>}
              <button type="submit" className="btn-primary mt-6">
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
