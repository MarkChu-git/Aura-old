import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LiquidButton from './LiquidButton';

// Reusable Input Component
const AuthInput = ({ icon: Icon, endIcon, onEndIconClick, ...props }) => (
    <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <div style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'hsl(var(--color-text-muted))',
            pointerEvents: 'none'
        }}>
            <Icon size={18} />
        </div>
        <input
            {...props}
            style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                paddingRight: endIcon ? '2.5rem' : '1rem',
                borderRadius: '0.75rem',
                border: '1px solid hsl(var(--color-border))',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                outline: 'none'
            }}
        />
        {endIcon && (
            <button
                type="button"
                onClick={onEndIconClick}
                style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'hsl(var(--color-text-muted))',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {endIcon}
            </button>
        )}
    </div>
);

const RequirementItem = ({ met, text }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: met ? 'hsl(var(--color-success))' : 'hsl(var(--color-text-muted))', // Fixed colors to use variables if possible, or fallbacks
        transition: 'color 0.3s ease'
    }}>
        {met ? <Check size={14} color="#10B981" /> : <X size={14} />}
        <span style={{ color: met ? '#10B981' : 'inherit' }}>{text}</span>
    </div>
);

export default function AuthModal({ isOpen, onClose }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { t } = useTranslation();
    const googleButtonRef = useRef(null);

    const requirements = {
        length: password.length >= 10,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };

    useEffect(() => {
        setError('');
        if (!isOpen) {
            // Reset form on close
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setMode('login');
        }
    }, [isOpen]);

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
                            setLoading(true);
                            const data = await api.googleAuth(response.credential);
                            login(data.access_token);
                            onClose();
                        } catch (error) {
                            console.error("Google auth error:", error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'register') {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                const allMet = Object.values(requirements).every(Boolean);
                if (!allMet) {
                    throw new Error("Password does not meet all requirements");
                }
                const res = await api.register(email, password);
                // Depending on API, register might return token or just success
                // api.register returns data. If autologin is desired:
                // Usually we might need to login after register or if the API returns token
                // Assuming api.register returns similar stucture or we login automatically
                // The current api.register returns json. 
                // Let's assume we need to auto-login.
                const loginRes = await api.login(email, password);
                login(loginRes.access_token);
            } else {
                const res = await api.login(email, password);
                login(res.access_token);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

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
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
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
                        {mode === 'login' ? t('auth.welcome') : 'Create Account'}
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

                <form onSubmit={handleSubmit}>
                    <AuthInput
                        icon={Mail}
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoFocus
                    />

                    <AuthInput
                        icon={Lock}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        required
                        endIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        onEndIconClick={() => setShowPassword(!showPassword)}
                    />

                    {mode === 'login' && (
                        <div style={{
                            textAlign: 'right',
                            marginTop: '-0.5rem',
                            marginBottom: '1rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => {
                                    alert('Password reset functionality coming soon!\n\nFor now, please contact support to reset your password.');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'hsl(var(--color-text-muted))',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    padding: 0,
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseOver={(e) => e.target.style.color = 'hsl(var(--color-text-main))'}
                                onMouseOut={(e) => e.target.style.color = 'hsl(var(--color-text-muted))'}
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {mode === 'register' && isPasswordFocused && (
                        <div style={{
                            background: 'hsl(var(--color-text-main) / 0.03)',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem'
                        }} onMouseDown={(e) => e.preventDefault()}>
                            <RequirementItem met={requirements.length} text="10+ Characters" />
                            <RequirementItem met={requirements.upper} text="Uppercase" />
                            <RequirementItem met={requirements.lower} text="Lowercase" />
                            <RequirementItem met={requirements.number} text="Number" />
                            <RequirementItem met={requirements.special} text="Symbol (!@#$)" />
                        </div>
                    )}

                    {mode === 'register' && (
                        <AuthInput
                            icon={Check}
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    )}

                    <LiquidButton
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </LiquidButton>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    margin: '1.5rem 0',
                    color: 'hsl(var(--color-text-muted))',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ height: '1px', flex: 1, background: 'hsl(var(--color-border))' }}></div>
                    <span>or</span>
                    <div style={{ height: '1px', flex: 1, background: 'hsl(var(--color-border))' }}></div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    justifyContent: 'center'
                }}>
                    {/* Container for the Google Button */}
                    <div ref={googleButtonRef} style={{ minHeight: '40px', minWidth: '240px' }}></div>
                </div>

                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'hsl(var(--color-text-muted))'
                }}>
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'hsl(var(--color-primary))',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0
                        }}
                    >
                        {mode === 'login' ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
