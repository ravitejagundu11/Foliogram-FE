import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@contexts/AuthContext'
import { UserManagementProvider } from '@contexts/UserManagementContext'
import { BlogProvider } from '@contexts/BlogContext'
import Layout from '@components/layout/Layout'
import ProtectedRoute from '@components/ProtectedRoute'
import HomePage from '@pages/HomePage'
import AboutPage from '@pages/AboutPage'
import ContactPage from '@pages/ContactPage'
import DashboardPage from '@pages/DashboardPage'
import ProfilePage from '@pages/ProfilePage'
import LoginPage from '@pages/LoginPage'
import SignUpPage from '@pages/SignUpPage'
import UserManagementPage from '@pages/UserManagementPage'
import BlogListPage from '@pages/BlogListPage'
import BlogDetailPage from '@pages/BlogDetailPage'
import CreatePostPage from '@pages/CreatePostPage'
import NotFound from '@pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <UserManagementProvider>
        <BlogProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="blog"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <BlogListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="blog/create"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <CreatePostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="blog/:id"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <BlogDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/user-management"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BlogProvider>
      </UserManagementProvider>
    </AuthProvider>
  )
}

export default App
