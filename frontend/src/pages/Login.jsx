import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import LiquidButton from '../components/LiquidButton';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/chat';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await api.login(email, password);
            login(data.access_token);
            navigate(from, { replace: true });
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            paddingTop: '4rem'
        }}>
            <div className="liquid-glass" style={{
                padding: '3rem',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '400px',
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
                    <Lock size={20} color="hsl(var(--color-text-main))" />
                </div>

                <h2 style={{ marginBottom: '2rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>Sign In</h2>

                {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text" // Allow simple username if we change from email later
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    <LiquidButton type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        Sign In
                    </LiquidButton>
                </form>
                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'hsl(var(--color-text-main))', fontWeight: 500 }}>Create one</Link>
                </div>
            </div>
        </div>
    );
}
