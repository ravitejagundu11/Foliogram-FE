import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { useEffect } from 'react'
import '../styles/HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="home-container">
      <div className="home-background" />
      <div className="home-overlay" />
      
      <div className="home-content">
        <div className="home-text-container">
          <h1 className="home-title">
            Welcome to Foliogram
          </h1>
          <p className="home-subtitle">
            Your portfolio platform to showcase your work and creativity
          </p>
          <div className="home-button-group">
            <button
              onClick={() => navigate('/login')}
              className="home-button-primary"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/about')}
              className="home-button-secondary"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
