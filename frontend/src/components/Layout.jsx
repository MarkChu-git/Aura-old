/**
 * Main Layout Component
 * ---------------------
 * This component defines the overall structure of the application pages.
 * It includes the Header, Main Content Area, Footer, and the Global Auth Modal.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render in the main area.
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Navigation Header */}
            <Header />

            {/* Main Content Area */}
            <main style={{ flex: 1 }}>
                {children || <Outlet />}
            </main>

            {/* Page Footer */}
            <Footer />

            {/* Global Authentication Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                initialMode={authModalMode}
            />
        </div>
    );
}
