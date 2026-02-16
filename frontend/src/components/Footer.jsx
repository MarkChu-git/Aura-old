/**
 * Footer Component
 * ----------------
 * The page footer displaying copyright, links, and branding.
 *
 * @component
 */

import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer style={{
            padding: '3rem 0',
            borderTop: '1px solid hsl(var(--color-border))',
            marginTop: 'auto',
            color: 'hsl(var(--color-text-muted))',
            fontSize: '0.875rem'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontWeight: '500',
                    color: 'hsl(var(--color-text-main))'
                }}>
                    <Logo size={24} />
                    <span>AURA</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <Link
                        to="/privacy"
                        style={{
                            transition: 'color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'hsl(var(--color-text-main))'}
                        onMouseLeave={(e) => e.target.style.color = 'hsl(var(--color-text-muted))'}
                    >
                        Privacy
                    </Link>
                    <Link
                        to="/terms"
                        style={{
                            transition: 'color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'hsl(var(--color-text-main))'}
                        onMouseLeave={(e) => e.target.style.color = 'hsl(var(--color-text-muted))'}
                    >
                        Terms
                    </Link>
                </div>
                <div style={{ opacity: 0.5 }}>
                    &copy; {new Date().getFullYear()}
                </div>
            </div>
        </footer>
    );
}
