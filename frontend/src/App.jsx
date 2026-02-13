/**
 * @file App.jsx
 * @author Aura Team
 * @created 2024-01-01
 * @description The main application component. Sets up the routing configuration,
 * global providers (Auth, Language), and the persistent background effect.
 */

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Explore from './pages/Explore';
import Analyzing from './pages/Analyzing';
import Result from './pages/Result';
import Profile from './pages/Profile';
import Announcements from './pages/Announcements';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Background from './components/Background';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

/**
 * App Component.
 * 
 * Root component that orchestrates the application structure.
 * 
 * Architecture:
 * - Providers: Wraps the app in AuthProvider and LanguageProvider for global state.
 * - Routing: Defines all client-side routes using react-router-dom.
 * - Layout: Most routes are wrapped in a common Layout component (Header, Main content).
 * - Background: Renders the global canvas background effect.
 * 
 * Routes:
 * - Public: Home, Login, Register, Explore, etc.
 * - Protected: Profile (implicitly protected by state checks, though explicitly handled in component).
 * - Admin: /admin routes protected by AdminRoute.
 * 
 * @component
 * @returns {JSX.Element} The rendered application
 */
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
          <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
          
          {/* Feature Routes */}
          <Route path="/chat" element={<Layout><Chat /></Layout>} />
          <Route path="/explore" element={<Layout><Explore /></Layout>} />
          <Route path="/announcements" element={<Layout><Announcements /></Layout>} />
          <Route path="/analyzing" element={<Layout><Analyzing /></Layout>} />
          <Route path="/result" element={<Layout><Result /></Layout>} />
          
          {/* User Routes */}
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          
          {/* Static Pages */}
          <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
          <Route path="/terms" element={<Layout><Terms /></Layout>} />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
          <Route path="/admin/announcements" element={<AdminRoute><Layout><AdminAnnouncements /></Layout></AdminRoute>} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<Layout><div style={{ padding: '4rem', textAlign: 'center' }}>Page not found</div></Layout>} />
        </Routes>
        
        {/* Global Background Effect */}
        <Background />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
