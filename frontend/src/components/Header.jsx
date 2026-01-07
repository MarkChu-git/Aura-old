import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LiquidButton from './LiquidButton';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, openAuthModal, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="liquid-glass animate-fade-in" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{
                height: '75px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo - Premium Serif */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    color: 'hsl(var(--color-text-main))'
                }}>
                    <Logo size={40} />
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '400',
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-serif)'
                    }}>
                        AURA
                    </span>
                </Link>

                {/* Desktop Nav - Centered */}
                <nav style={{
                    display: 'none',
                    gap: '2.5rem',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    '@media (min-width: 768px)': { display: 'flex' }
                }} className="desktop-nav">
                    {[
                        { path: '/', label: t('header.home') },
                        { path: '/explore', label: t('header.explore') },
                        { path: '/profile', label: t('header.profile') }
                    ].map(({ path, label }) => (
                        <Link
                            key={path}
                            to={path}
                            style={{
                                opacity: isActive(path) ? 1 : 0.6,
                                fontWeight: isActive(path) ? '500' : '400',
                                fontSize: '0.9375rem',
                                position: 'relative',
                                transition: 'all var(--transition-base)',
                                letterSpacing: '0.01em'
                            }}
                        >
                            {label}
                            {isActive(path) && (
                                <span style={{
                                    position: 'absolute',
                                    bottom: '-6px',
                                    left: 0,
                                    right: 0,
                                    height: '1px',
                                    background: 'hsl(var(--color-text-main))',
                                    borderRadius: '1px'
                                }} />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div style={{ display: 'none', gap: '1rem', '@media (min-width: 768px)': { display: 'flex' } }} className="desktop-actions">
                    <LanguageSwitcher />
                    {!isAuthenticated ? (
                        <>
                            <button
                                onClick={() => openAuthModal('login')}
                                style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    padding: '0.6rem 1.4rem',
                                    borderRadius: '2rem',
                                    border: '1px solid hsl(var(--color-border))',
                                    transition: 'all 0.3s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'hsl(var(--color-text-main))',
                                    background: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('header.signIn')}
                            </button>
                            <button
                                onClick={() => openAuthModal('register')}
                                style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    padding: '0.6rem 1.4rem',
                                    borderRadius: '2rem',
                                    background: 'hsl(var(--color-text-main))',
                                    color: 'hsl(var(--color-surface))',
                                    transition: 'all 0.3s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('header.getStarted')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={logout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'hsl(var(--color-text-muted))',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => e.target.style.color = 'hsl(var(--color-text-main))'}
                            onMouseLeave={e => e.target.style.color = 'hsl(var(--color-text-muted))'}
                        >
                            <LogOut size={18} />
                            <span>{t('header.signOut')}</span>
                        </button>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <LiquidButton
                    className="mobile-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        zIndex: 101 // Ensure above glass
                    }}
                >
                    {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </LiquidButton>
            </div>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className="liquid-glass animate-fade-in" style={{
                    position: 'fixed',
                    top: '75px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    zIndex: 99
                }}>
                    {[
                        { path: '/', label: t('header.home') },
                        { path: '/explore', label: t('header.explore') },
                        { path: '/profile', label: t('header.profile') }
                    ].map(({ path, label }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: isActive(path) ? '500' : '400',
                                opacity: isActive(path) ? 1 : 0.7
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                    <div style={{ height: '1px', background: 'hsl(var(--color-border))', margin: '0.5rem 0' }} />

                    {!isAuthenticated ? (
                        <>
                            <button
                                onClick={() => { setIsMenuOpen(false); openAuthModal('login'); }}
                                style={{ fontSize: '1.1rem', background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}
                            >
                                {t('header.signIn')}
                            </button>
                            <button
                                onClick={() => { setIsMenuOpen(false); openAuthModal('register'); }}
                                style={{ fontSize: '1.1rem', fontWeight: 500, background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}
                            >
                                {t('header.getStarted')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => { setIsMenuOpen(false); logout(); }}
                            style={{ fontSize: '1.1rem', color: '#EF4444', background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}
                        >
                            {t('header.signOut')}
                        </button>
                    )}
                </div>
            )}

            <style>{`
        @media (min-width: 768px) {
          .mobile-toggle { display: none; }
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
        }
        @media (max-width: 767px) {
            .desktop-nav { display: none !important; }
            .desktop-actions { display: none !important; }
        }
        
        .desktop-nav a:hover {
          opacity: 1 !important;
        }
      `}</style>
        </header>
    );
}
