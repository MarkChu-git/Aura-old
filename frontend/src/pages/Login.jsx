import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lock, AlertCircle } from 'lucide-react';

export default function Login() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/chat';
    const googleButtonRef = useRef(null);

    useEffect(() => {
        // Function to render the button
        const renderGoogleButton = () => {
            if (window.google?.accounts?.id && googleButtonRef.current) {
                // Initialize the client
                console.log("Initializing Google Sign-In client with ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: async (response) => {
                        console.log("Google Sign-In callback received", response);
                        try {
                            setLoading(true);
                            const data = await api.googleAuth(response.credential);
                            console.log("Backend auth success:", data);
                            login(data.access_token);
                            navigate(from, { replace: true });
                        } catch (error) {
                            console.error("Google auth error details:", error);
                            setError(error.message || t('auth.error'));
                        } finally {
                            setLoading(false);
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
                        width: '330', // MAX width to match container
                        logo_alignment: 'center'
                    }
                );
            }
        };

        // Check if script is loaded, if not wait a bit or just retry
        if (window.google?.accounts?.id) {
            renderGoogleButton();
        } else {
            const timer = setTimeout(renderGoogleButton, 500);
            return () => clearTimeout(timer);
        }

    }, [login, navigate, from, t]);

    return (
        <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            paddingTop: '4rem'
        }}>
            <div className="liquid-glass" style={{
                padding: '3rem 2rem',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                background: 'hsl(var(--color-surface) / 0.98)'
            }}>
                <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'hsl(var(--color-text-main) / 0.05)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <Lock size={20} color="hsl(var(--color-text-main))" />
                </div>

                <h2 style={{
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 500,
                    fontSize: '2rem',
                    color: 'hsl(var(--color-text-main))'
                }}>
                    {t('auth.welcome')}
                </h2>

                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '1rem', marginBottom: '2rem' }}>
                    {t('auth.subtitle')}
                </p>

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
                        gap: '0.5rem',
                        justifyContent: 'center'
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
                    minHeight: '60px',
                    justifyContent: 'center'
                }}>
                    {loading && <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{t('auth.processing')}</div>}

                    {/* Container for the Google Button */}
                    <div ref={googleButtonRef} style={{ minHeight: '40px', minWidth: '240px' }}></div>
                </div>
            </div>
        </div>
    );
}
