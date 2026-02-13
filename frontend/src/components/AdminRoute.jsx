/**
 * Admin Route Protection Component
 * --------------------------------
 * This component protects routes that require administrative privileges.
 * It checks if the user is authenticated and has the 'admin' role.
 * Redirects to home page if access is denied.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render if authorized.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
    const { isAuthenticated, user, isLoadingUser } = useAuth();

    // Show loading state while checking auth
    if (isLoadingUser) {
        return <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>Loading...</div>;
    }

    // Redirect if not authenticated or not an admin
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}
