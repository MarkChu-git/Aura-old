/**
 * Language Switcher Component
 * ---------------------------
 * A dropdown component that allows users to change the application language.
 *
 * @component
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const { changeLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'zh', name: 'Chinese', nativeName: '中文' },
        { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' }
    ];

    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Handle language selection.
     * @param {string} langCode - The selected language code.
     */
    const handleLanguageChange = async (langCode) => {
        await changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid hsl(var(--color-border))',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: 'hsl(var(--color-text-main))',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-surface))'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <Globe size={18} />
                <span>{currentLang.nativeName}</span>
            </button>

            {isOpen && (
                <div
                    className="liquid-glass animate-fade-in"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        minWidth: '180px',
                        borderRadius: '0.75rem',
                        border: '1px solid hsl(var(--color-border))',
                        background: 'hsl(var(--color-surface) / 0.95)',
                        backdropFilter: 'blur(10px)',
                        padding: '0.5rem',
                        zIndex: 1000,
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                border: 'none',
                                background: i18n.language === lang.code
                                    ? 'hsl(var(--color-text-main) / 0.1)'
                                    : 'transparent',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: i18n.language === lang.code ? '500' : '400',
                                color: 'hsl(var(--color-text-main))',
                                transition: 'all 0.2s ease',
                                marginBottom: '0.25rem'
                            }}
                            onMouseEnter={e => {
                                if (i18n.language !== lang.code) {
                                    e.currentTarget.style.background = 'hsl(var(--color-text-main) / 0.05)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (i18n.language !== lang.code) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <div style={{ fontWeight: '500' }}>{lang.nativeName}</div>
                            <div style={{
                                fontSize: '0.8rem',
                                color: 'hsl(var(--color-text-muted))',
                                marginTop: '0.1rem'
                            }}>
                                {lang.name}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
