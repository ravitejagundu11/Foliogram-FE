const ProfilePage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />
        
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-400">JD</span>
            </div>
            <button className="ml-auto mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Edit Profile
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">John Doe</h1>
            <p className="text-gray-600">@johndoe</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Creative designer and photographer based in San Francisco. Passionate about creating
              beautiful and functional digital experiences.
            </p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span><strong className="text-gray-900">24</strong> Projects</span>
              <span><strong className="text-gray-900">789</strong> Followers</span>
              <span><strong className="text-gray-900">456</strong> Following</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">john.doe@example.com</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900">San Francisco, CA</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <p className="text-blue-600 hover:underline cursor-pointer">www.johndoe.com</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">January 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
