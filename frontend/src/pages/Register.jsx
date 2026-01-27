import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import LiquidButton from '../components/LiquidButton';
import { UserPlus, Check, X, Eye, EyeOff } from 'lucide-react';

const RequirementItem = ({ met, text }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: met ? '#10B981' : '#EF4444',
        transition: 'color 0.3s ease'
    }}>
        {met ? <Check size={14} /> : <X size={14} />}
        <span>{text}</span>
    </div>
);

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Derive requirements directly from password state
    const requirements = {
        length: password.length >= 12,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const isPasswordValid = Object.values(requirements).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (!isPasswordValid) {
            setError("Please meet all password requirements");
            return;
        }

        try {
            await api.register(email, password);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            paddingTop: '4rem',
            paddingBottom: '4rem'
        }}>
            <div className="liquid-glass" style={{
                padding: '3rem',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '450px',
                textAlign: 'center'
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
                    <UserPlus size={20} color="hsl(var(--color-text-main))" />
                </div>

                <h2 style={{ marginBottom: '2rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>Create Account</h2>

                {error && <div style={{ color: '#EF4444', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#FEF2F2', borderRadius: '0.5rem' }}>{error}</div>}
                {success && <div style={{ color: '#10B981', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#ECFDF5', borderRadius: '0.5rem' }}>{success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'white',
                            fontSize: '1rem'
                        }}
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                padding: '0.75rem 1rem',
                                paddingRight: '2.5rem',
                                borderRadius: '0.75rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'white',
                                fontSize: '1rem',
                                width: '100%'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
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
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Password Strength Meter */}
                    <div style={{
                        textAlign: 'left',
                        background: 'hsl(var(--color-text-main) / 0.03)',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem'
                    }}>
                        <RequirementItem met={requirements.length} text="12+ Characters" />
                        <RequirementItem met={requirements.upper} text="Uppercase" />
                        <RequirementItem met={requirements.lower} text="Lowercase" />
                        <RequirementItem met={requirements.number} text="Number" />
                        <RequirementItem met={requirements.special} text="Symbol (!@#$)" />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{
                                padding: '0.75rem 1rem',
                                paddingRight: '2.5rem',
                                borderRadius: '0.75rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'white',
                                fontSize: '1rem',
                                width: '100%'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <LiquidButton type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        Register
                    </LiquidButton>
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>
                    Already have an account? <Link to="/login" style={{ color: 'hsl(var(--color-text-main))', fontWeight: 500 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
}

