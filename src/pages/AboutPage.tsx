const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Foliogram</h1>
      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-4">
          Foliogram is a modern portfolio platform designed to help creators showcase their work
          and connect with audiences worldwide.
        </p>
        <p className="text-lg text-gray-600 mb-4">
          Our mission is to provide an intuitive and powerful platform for artists, photographers,
          designers, and all creative professionals to display their portfolios beautifully.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
            <p className="text-gray-600">Simple and intuitive interface for creating stunning portfolios</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Customizable</h3>
            <p className="text-gray-600">Flexible design options to match your unique style</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
            <p className="text-gray-600">Stand out with professional-grade portfolio presentations</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
