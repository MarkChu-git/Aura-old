import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import AnnouncementBanner from './AnnouncementBanner';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AnnouncementBanner />
            <Header />
            <main style={{ flex: 1 }}>
                {children || <Outlet />}
            </main>
            <Footer />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                initialMode={authModalMode}
            />
        </div>
    );
}
