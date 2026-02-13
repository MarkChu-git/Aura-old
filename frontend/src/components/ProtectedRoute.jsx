/**
 * Protected Route Component
 * -------------------------
 * This component protects routes that require authentication.
 * It redirects unauthenticated users to the home page.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render if authorized.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoadingUser } = useAuth();

    // Show loading state while checking auth
    if (isLoadingUser) {
        return <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>Loading...</div>;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}
