import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Megaphone, Calendar, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState({});

    useEffect(() => {
        loadAnnouncements();
        loadDismissedState();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const response = await api.getActiveAnnouncements();
            setAnnouncements(response.data || []);
        } catch (error) {
            console.error('Failed to load announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDismissedState = () => {
        const dismissedState = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '{}');
        setDismissed(dismissedState);
    };

    const handleDismiss = (id) => {
        const newDismissed = { ...dismissed, [id]: true };
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
        setDismissed(newDismissed);
        window.dispatchEvent(new Event('storage'));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', color: 'hsl(var(--color-text-muted))' }}>
                    Loading announcements...
                </div>
            </div>
        );
    }

    const activeAnnouncements = announcements.filter(a => !dismissed[a.id]);

    return (
        <div className="container" style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                }}>
                    <Megaphone size={32} style={{ color: '#667eea' }} />
                    <h1 style={{ 
                        fontSize: '2.5rem',
                        fontWeight: '600',
                        margin: 0,
                        fontFamily: 'var(--font-serif)'
                    }}>
                        Announcements
                    </h1>
                </div>
                <p style={{ 
                    fontSize: '1.1rem',
                    color: 'hsl(var(--color-text-muted))',
                    margin: 0 
                }}>
                    Stay updated with the latest news and updates
                </p>
            </div>

            {activeAnnouncements.length === 0 ? (
                <div 
                    className="liquid-glass"
                    style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        borderRadius: '1rem'
                    }}
                >
                    <Megaphone size={48} style={{ 
                        color: 'hsl(var(--color-text-muted))',
                        opacity: 0.3,
                        marginBottom: '1rem'
                    }} />
                    <h3 style={{ 
                        fontSize: '1.25rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        color: 'hsl(var(--color-text-main))'
                    }}>
                        No announcements
                    </h3>
                    <p style={{ 
                        color: 'hsl(var(--color-text-muted))',
                        margin: 0
                    }}>
                        You're all caught up! Check back later for updates.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {activeAnnouncements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="liquid-glass"
                            style={{
                                padding: '2rem',
                                borderRadius: '1rem',
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <button
                                onClick={() => handleDismiss(announcement.id)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'hsl(var(--color-text-muted))',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'hsl(var(--color-border))';
                                    e.target.style.color = 'hsl(var(--color-text-main))';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = 'hsl(var(--color-text-muted))';
                                }}
                                title="Dismiss"
                            >
                                <X size={18} />
                            </button>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.75rem',
                                color: 'hsl(var(--color-text-muted))',
                                fontSize: '0.875rem'
                            }}>
                                <Calendar size={14} />
                                <span>{formatDate(announcement.created_at)}</span>
                            </div>

                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                paddingRight: '2rem',
                                color: 'hsl(var(--color-text-main))'
                            }}>
                                {announcement.title}
                            </h2>

                            <div style={{
                                fontSize: '1rem',
                                lineHeight: '1.7',
                                color: 'hsl(var(--color-text-secondary))',
                                margin: 0
                            }}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({children}) => <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>{children}</h1>,
                                        h2: ({children}) => <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>{children}</h2>,
                                        h3: ({children}) => <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{children}</h3>,
                                        p: ({children}) => <p style={{ marginBottom: '1rem' }}>{children}</p>,
                                        ul: ({children}) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>{children}</ul>,
                                        ol: ({children}) => <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>{children}</ol>,
                                        li: ({children}) => <li style={{ marginBottom: '0.5rem' }}>{children}</li>,
                                        a: ({children, href}) => <a href={href} style={{ color: '#667eea', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{children}</a>,
                                        code: ({inline, children}) => inline
                                            ? <code style={{
                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: '0.25rem',
                                                    fontSize: '0.9em',
                                                    fontFamily: 'monospace',
                                                    color: '#667eea'
                                                }}>{children}</code>
                                            : <code style={{
                                                    display: 'block',
                                                    background: 'hsl(var(--color-surface))',
                                                    padding: '1rem',
                                                    borderRadius: '0.5rem',
                                                    overflowX: 'auto',
                                                    marginBottom: '1rem',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.9em'
                                                }}>{children}</code>,
                                        blockquote: ({children}) => <blockquote style={{
                                            borderLeft: '4px solid #667eea',
                                            paddingLeft: '1rem',
                                            fontStyle: 'italic',
                                            color: 'hsl(var(--color-text-muted))',
                                            marginBottom: '1rem',
                                            marginLeft: 0
                                        }}>{children}</blockquote>,
                                        strong: ({children}) => <strong style={{ fontWeight: 700 }}>{children}</strong>
                                    }}
                                >
                                    {announcement.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
