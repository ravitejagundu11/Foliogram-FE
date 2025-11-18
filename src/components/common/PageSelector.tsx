import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

const PageSelector = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const pages = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/profile' },
  ]

  const handlePageChange = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Page Selector"
        >
          <Menu size={24} />
        </button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] overflow-hidden z-50">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Navigate to:</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {pages.map((page) => (
                <button
                  key={page.path}
                  onClick={() => handlePageChange(page.path)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                    location.pathname === page.path
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {page.name}
                  {location.pathname === page.path && (
                    <span className="ml-2 text-blue-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default PageSelector
