import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { authApi } from '@services/api'

import '../styles/LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState({ email: false, password: false })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate empty fields first
    const emptyEmail = email.trim() === ''
    const emptyPassword = password.trim() === ''
    if (emptyEmail || emptyPassword) {
      setInvalid({ email: emptyEmail, password: emptyPassword })
      setError('Please fill in all fields')
      return
    }

    // reset empty-field validation
    setInvalid({ email: false, password: false })

    setLoading(true)

    try {
      // Call login API
      const response = await authApi.login({ email, password })
      
      // Parse full name
      const nameParts = response.user.full_name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Successful login - set user data
      const userData = {
        username: response.user.email.split('@')[0],
        email: response.user.email,
        firstName,
        lastName,
        contactNumber: '',
        role: 'user' as const,
        profileImage: '',
      }
      
      // Store everything in localStorage first
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
      
      // Then update context
      login(userData)
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          Welcome Back
        </h1>
        <p className="login-subtitle">Sign in to your Foliogram account</p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="email" className="login-form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
                setInvalid((s) => ({ ...s, email: false }))
              }}
              placeholder="Enter your email"
              className={`login-form-input ${invalid.email ? 'input-error' : ''}`}
              required
              disabled={loading}
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
                setInvalid((s) => ({ ...s, password: false }))
              }}
              placeholder="Enter your password"
              className={`login-form-input ${invalid.password ? 'input-error' : ''}`}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <p className="login-divider-text">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="login-signup-link"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
