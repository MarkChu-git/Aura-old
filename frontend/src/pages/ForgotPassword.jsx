/**
 * @file ForgotPassword.jsx
 * @author Aura Team
 * @created 2024-01-01
 * @description Page to initiate the password reset process. Allows users to request
 * a password reset token by providing their email address.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { api } from '../services/api';

/**
 * ForgotPassword Page Component.
 * 
 * Handles the "Forgot Password" flow.
 * 1. User enters email.
 * 2. System validates and (in this dev version) returns a token or sends an email.
 * 3. User copies token or proceeds to reset link.
 * 
 * @component
 * @returns {JSX.Element} The ForgotPassword page
 */
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [copied, setCopied] = useState(false);

    /**
     * Handles the form submission to request a reset token.
     * 
     * @param {Event} e - Form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.forgotPassword(email);
            if (response.token) {
                // In a real production app, this token would be emailed.
                // For this implementation, we display it to the user.
                setToken(response.token);
                setExpiresAt(response.expires_at);
            } else {
                setError('If an account exists with that email, a reset token has been generated.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate reset token');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Copies the generated token to the clipboard.
     */
    const copyToken = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (token) {
        return (
            <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '4rem 1.5rem' }}>
                <div className="liquid-glass" style={{ padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-surface) / 0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                            <CheckCircle size={24} color="#10B981" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reset Token Generated</h2>
                    </div>

                    <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))', marginBottom: '0.5rem' }}>Your Reset Token:</div>
                        <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.75rem', background: 'hsl(var(--color-surface))', borderRadius: '0.5rem' }}>
                            {token}
                        </div>
                        <button
                            onClick={copyToken}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: 'hsl(var(--color-text-main))'
                            }}
                        >
                            <Copy size={16} />
                            {copied ? 'Copied!' : 'Copy Token'}
                        </button>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))', marginBottom: '1.5rem' }}>
                        This token will expire at {new Date(expiresAt).toLocaleString()}
                    </div>

                    <Link
                        to="/reset-password"
                        state={{ token }}
                        className="btn-primary"
                        style={{
                            display: 'inline-block',
                            width: '100%',
                            textAlign: 'center',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            background: 'hsl(var(--color-text-main))',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 500
                        }}
                    >
                        Continue to Reset Password
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '4rem 1.5rem' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'hsl(var(--color-text-muted))', textDecoration: 'none', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} />
                Back to Login
            </Link>

            <div className="liquid-glass" style={{ padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-surface) / 0.6)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'hsl(var(--color-text-main) / 0.1)', borderRadius: '1rem', marginBottom: '1rem' }}>
                        <Mail size={32} color="hsl(var(--color-text-main))" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Forgot Password?</h2>
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.95rem' }}>
                        Enter your email to receive a password reset token
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
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
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
                        {loading ? 'Generating Token...' : 'Send Reset Token'}
                    </button>
                </form>
            </div>
        </div>
    );
}
