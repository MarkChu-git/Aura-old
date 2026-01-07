import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Get token from location state or URL params
        if (location.state?.token) {
            setToken(location.state.token);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('No reset token provided');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 10) {
            setError('Password must be at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            await api.resetPassword({ token, new_password: newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '4rem 1.5rem' }}>
                <div className="liquid-glass" style={{ padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-surface) / 0.6)', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', marginBottom: '1rem' }}>
                        <CheckCircle size={48} color="#10B981" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password Reset Successful!</h2>
                    <p style={{ color: 'hsl(var(--color-text-muted))', marginBottom: '1.5rem' }}>
                        Your password has been updated. Redirecting to login...
                    </p>
                    <Link to="/login" style={{ color: 'hsl(var(--color-text-main))', textDecoration: 'none', fontWeight: 500 }}>
                        Go to Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '4rem 1.5rem' }}>
            <Link to="/forgot-password" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'hsl(var(--color-text-muted))', textDecoration: 'none', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} />
                Back
            </Link>

            <div className="liquid-glass" style={{ padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-surface) / 0.6)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'hsl(var(--color-text-main) / 0.1)', borderRadius: '1rem', marginBottom: '1rem' }}>
                        <Lock size={32} color="hsl(var(--color-text-main))" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reset Your Password</h2>
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.95rem' }}>
                        Enter your new password below
                    </p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            Reset Token
                        </label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your reset token here"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'hsl(var(--color-surface))',
                                fontSize: '0.9rem',
                                fontFamily: 'monospace'
                            }}
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'hsl(var(--color-surface))',
                                fontSize: '1rem'
                            }}
                            disabled={loading}
                        />
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', marginTop: '0.25rem' }}>
                            At least 10 characters with uppercase, lowercase, number, and special character
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'hsl(var(--color-surface))',
                                fontSize: '1rem'
                            }}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: 'hsl(var(--color-text-main))',
                            color: '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            fontWeight: 500,
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
