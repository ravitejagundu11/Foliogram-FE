import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@services/api'

import '../styles/SignUpPage.css'

const SignUpPage = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    // Check password strength
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasUpper || !hasLower || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      return
    }

    setLoading(true)

    try {
      // Call register API
      await authApi.register({
        full_name: fullName,
        email,
        password,
      })

      // Show success and redirect to login
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">
          Join Foliogram
        </h1>
        <p className="signup-subtitle">Create your account to get started</p>

        {error && (
          <div className="signup-error">
            {error}
          </div>
        )}

        {success && (
          <div className="signup-success">
            <span className="signup-success-message">
            ✓ Account created successfully! Redirecting to login...
                      </span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-form-group">
              <label htmlFor="fullName" className="signup-form-label">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setError('')
                }}
                placeholder="John Doe"
                className="signup-form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="signup-form-group">
              <label htmlFor="email" className="signup-form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="your@email.com"
                className="signup-form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="signup-form-group">
              <label htmlFor="password" className="signup-form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="At least 8 characters with A-z, 0-9"
                className="signup-form-input"
                required
                disabled={loading}
              />
              <p className="signup-form-hint">
                Must be 8+ characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div className="signup-form-group">
              <label htmlFor="confirmPassword" className="signup-form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                placeholder="Confirm your password"
                className="signup-form-input"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="signup-divider">
          <p className="signup-divider-text">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="signup-signin-link"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
