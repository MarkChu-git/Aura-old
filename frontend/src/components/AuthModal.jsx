import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
    const [error, setError] = useState('');

    const { login } = useAuth();
    const { t } = useTranslation();
    const googleButtonRef = useRef(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (isOpen) setError('');
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isOpen) return;

        // Function to render the button
        const renderGoogleButton = () => {
            if (window.google?.accounts?.id && googleButtonRef.current) {
                // Initialize the client
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: async (response) => {
                        try {
                            const data = await api.googleAuth(response.credential);
                            login(data.access_token);
                            onClose();
                        } catch (error) {
                            console.error("Google auth error:", error);
                            setError(error.message || t('auth.error'));
                        }
                    },
                    auto_select: false,
                    itp_support: true
                });

                // Render the button
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    {
                        type: 'standard',
                        theme: 'outline',
                        size: 'large',
                        text: 'continue_with',
                        shape: 'pill',
                        width: '330', // MAX width to match container (400px - 4rem padding)
                        logo_alignment: 'center'
                    }
                );
            }
        };

        // Check if script is loaded, if not wait a bit or just retry
        if (window.google?.accounts?.id) {
            renderGoogleButton();
        } else {
            // Retry once after a short delay in case script is racing
            const timer = setTimeout(renderGoogleButton, 500);
            return () => clearTimeout(timer);
        }

    }, [isOpen, login, onClose, t]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="liquid-glass animate-scale-in" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '3rem 2rem',
                borderRadius: '1.5rem',
                background: 'hsl(var(--color-surface) / 0.98)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'hsl(var(--color-text-muted))',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        display: 'flex'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '2rem',
                        marginBottom: '0.75rem',
                        color: 'hsl(var(--color-text-main))'
                    }}>
                        {t('auth.welcome')}
                    </h2>
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '1rem' }}>
                        {t('auth.subtitle')}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#FEF2F2',
                        color: '#EF4444',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    justifyContent: 'center',
                    minHeight: '80px'
                }}>
                    {/* Container for the Google Button */}
                    <div ref={googleButtonRef} style={{ minHeight: '40px', minWidth: '240px' }}></div>
                </div>
            </div>
        </div>
    );
}

