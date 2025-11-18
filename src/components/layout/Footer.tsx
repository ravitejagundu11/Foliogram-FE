const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          <p>&copy; {currentYear} Foliogram. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
