import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@contexts/AuthContext'
import { PortfolioProvider } from '@contexts/PortfolioContext'
import { UserManagementProvider } from '@contexts/UserManagementContext'
import { BlogProvider } from '@contexts/BlogContext'
import { SubscriptionProvider } from '@contexts/SubscriptionContext'
import { NotificationProvider } from '@contexts/NotificationContext'
import Layout from '@components/layout/Layout'
import ProtectedRoute from '@components/ProtectedRoute'
import ErrorBoundary from '@components/ErrorBoundary'
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
import PublicPortfoliosPage from '@pages/PublicPortfoliosPage'
import NotFound from '@pages/NotFound'
import AppointmentManagement from './pages/AppointmentManagement'
import BookingPage from './pages/BookingPage'
import MyPortfolios from './pages/MyPortfolios'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminModerationPage from './pages/admin/AdminModerationPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PortfolioProvider>
          <UserManagementProvider>
            <NotificationProvider>
              <BlogProvider>
                <SubscriptionProvider>
              <Routes>
            {/* Public Portfolio View - No Layout */}
            <Route path="/portfolio/:portfolioId" element={<PortfolioPublic />} />
            <Route path="/:username" element={<PortfolioPublic />} />
            
            {/* Public Booking Page - No Layout */}
            <Route path="/booking/:portfolioId" element={<BookingPage />} />
            
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
              <Route
                path="my-portfolios"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "recruiter"]}>
                    <MyPortfolios />
                  </ProtectedRoute>
                }
              />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="portfolios" element={<PublicPortfoliosPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="appointment-management" element={<AppointmentManagement/>} />
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
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/moderation"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminModerationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotificationsPage />
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
        </PortfolioProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
