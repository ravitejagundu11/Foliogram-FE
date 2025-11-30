import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@contexts/AuthContext'
import { UserManagementProvider } from '@contexts/UserManagementContext'
import { BlogProvider } from '@contexts/BlogContext'
import { SubscriptionProvider } from '@contexts/SubscriptionContext'
import { NotificationProvider } from '@contexts/NotificationContext'
import Layout from '@components/layout/Layout'
import ProtectedRoute from '@components/ProtectedRoute'
import HomePage from '@pages/HomePage'
import WelcomePage from '@pages/WelcomePage'
import TemplateSelection from '@pages/TemplateSelection'
import PortfolioConfig from '@pages/PortfolioConfig'
import PortfolioPublic from '@pages/PortfolioPublic'
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
import UserSearchPage from '@pages/UserSearchPage'
import AnalyticsPage from '@pages/AnalyticsPage'
import NotificationsPage from '@pages/NotificationsPage'
import NotFound from '@pages/NotFound'
import AppointmentManagement from './pages/AppointmentManagement'
import BookingPage from './pages/BookingPage'

function App() {
  return (
    <AuthProvider>
      <UserManagementProvider>
        <NotificationProvider>
          <BlogProvider>
            <SubscriptionProvider>
              <Routes>
            {/* Public Portfolio View - No Layout */}
            <Route path="/portfolio/:portfolioId" element={<PortfolioPublic />} />
            <Route path="/:username" element={<PortfolioPublic />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="welcome" element={<WelcomePage />} />
              <Route
                path="templates"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <TemplateSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="portfolio/configure/:templateId"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <PortfolioConfig />
                  </ProtectedRoute>
                }
              />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="appointment-management" element={<AppointmentManagement/>} />
              <Route path="booking-page" element={<BookingPage/>} />
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
                path="users/search"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <UserSearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="notifications"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <NotificationsPage />
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
            </SubscriptionProvider>
          </BlogProvider>
        </NotificationProvider>
      </UserManagementProvider>
    </AuthProvider>
  )
}

export default App
