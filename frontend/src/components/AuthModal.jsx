import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
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

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // Password requirements state
    const [requirements, setRequirements] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    useEffect(() => {
        setRequirements({
            length: password.length >= 10,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [password]);

    const isPasswordValid = Object.values(requirements).every(Boolean);

    const { login } = useAuth();

    useEffect(() => {
        setMode(initialMode);
        setError('');
        setEmail('');
        setPassword('');
    }, [initialMode, isOpen]);

    if (!isOpen) return null;

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                const data = await api.login(email, password);
                login(data.access_token);
                onClose();
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                if (!isPasswordValid) {
                    throw new Error("Please meet all password requirements");
                }
                // Register then login
                await api.register(email, password);
                const data = await api.login(email, password);
                login(data.access_token);
                onClose();
            }
        } catch (err) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const RequirementItem = ({ met, text }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: met ? '#10B981' : '#EF4444',
            transition: 'color 0.3s ease',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '20px' }}>
                {met ? <Check size={14} /> : <X size={14} />}
            </div>
            <span style={{ lineHeight: '20px' }}>{text}</span>
        </div>
    );

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
                padding: '2rem',
                borderRadius: '1.5rem',
                background: 'hsl(var(--color-surface) / 0.95)',
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
                        fontSize: '1.75rem',
                        marginBottom: '0.5rem'
                    }}>
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                        {mode === 'login' ? 'Sign in to continue your journey' : 'Join Aura to explore fragrances'}
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
                        style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </LiquidButton>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'hsl(var(--color-text-muted))'
                }}>
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button
                                onClick={() => setMode('register')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'hsl(var(--color-text-main))',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => setMode('login')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'hsl(var(--color-text-main))',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
