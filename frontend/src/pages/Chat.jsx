import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, User, Bot, Sparkles, Loader2, MessageSquare, Plus, Menu as MenuIcon, Lock, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chat() {
    const { isAuthenticated, openAuthModal } = useAuth();
    const { t, i18n } = useTranslation();
    const location = useLocation();

    // State
    const [messages, setMessages] = useState([
        { role: 'assistant', content: t('chat.welcomeMessage') }
    ]);
    const [conversationId, setConversationId] = useState(null);
    const [historyList, setHistoryList] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Default hidden on mobile

    const messagesEndRef = useRef(null);

    // Fetch History on Mount/Auth Change
    useEffect(() => {
        if (isAuthenticated) {
            fetchHistory();
        } else {
            setHistoryList([]);
            setConversationId(null);
        }
    }, [isAuthenticated]);

    // Handle navigation from other pages (e.g. Profile)
    useEffect(() => {
        if (location.state?.conversationId && isAuthenticated) {
            loadConversation(location.state.conversationId);
            // Clear state to prevent loop if we were to act on it differently, but here it's fine.
            // Actually, we might want to ensure we don't reload if already loaded?
            // loadConversation checks 'loading' but not if current id matches. 
            // It sets id.
            // Good enough.
        }
    }, [location.state, isAuthenticated]);

    // Update welcome message when language changes if it's the only message
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === 'assistant') {
            setMessages([{ role: 'assistant', content: t('chat.welcomeMessage') }]);
        }
    }, [t, i18n.language]);

    const fetchHistory = async () => {
        try {
            const data = await api.getHistory();
            setHistoryList(data);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversation = async (id) => {
        if (loading) return;
        setHistoryLoading(true);
        try {
            const msgs = await api.getConversation(id);
            // Format DB messages to UI format
            const formatted = msgs.map(m => ({ role: m.role, content: m.content }));

            // If empty (shouldn't happen), add welcome? No, just show history.
            setMessages(formatted);
            setConversationId(id);
            if (window.innerWidth < 768) setShowSidebar(false); // Auto close on mobile
        } catch (err) {
            console.error("Failed to load conversation", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const startNewChat = () => {
        setConversationId(null);
        setMessages([
            { role: 'assistant', content: t('chat.welcomeMessage') }
        ]);
        if (window.innerWidth < 768) setShowSidebar(false);
    };
    // Delete Handler
    const handleDeleteChat = async (e, id) => {
        e.preventDefault(); // Prevent default link/button behavior
        e.stopPropagation(); // Prevent opening the chat when deleting
        if (window.confirm(t('chat.confirmDelete', 'Are you sure you want to delete this chat?'))) {
            try {
                // Optimistic update
                setHistoryList(prev => prev.filter(c => c.id !== id));
                if (conversationId === id) {
                    setConversationId(null);
                    setMessages([{ role: 'assistant', content: t('chat.welcomeMessage') }]);
                }
                await api.deleteConversation(id);
            } catch (err) {
                console.error("Delete failed", err);
                fetchHistory(); // Revert on fail
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };

        // Optimistic UI update
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        setLoading(true);

        try {
            // Call backend
            const response = await api.chat(newHistory, conversationId);

            // Append AI response
            setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);

            // If this was a new chat, we got a conversationId back. set it + refresh list
            if (!conversationId && response.conversation_id) {
                setConversationId(response.conversation_id);
            }

            // Trigger History Refresh
            // We do this on EVERY message to catch title updates (which happen around msg #5)
            // The backend runs in background, so we poll a few times
            if (isAuthenticated) {
                // Immediate update not strictly needed for title, but good for "last updated" sort
                // fetchHistory(); 

                // Poll for AI Title generation
                setTimeout(fetchHistory, 2000);
                setTimeout(fetchHistory, 5000);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: t('chat.error') }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{
            paddingTop: '6rem', // Header height
            paddingBottom: '2rem',
            maxWidth: '1200px', // Wider Layout
            height: '92vh', // Fixed height for scrolling
            display: 'flex',
            gap: '1.5rem',
            position: 'relative'
        }}>
            {/* Sidebar Toggle (Mobile) */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                style={{
                    position: 'absolute',
                    top: '5rem', // Adjust
                    left: '1rem',
                    zIndex: 20,
                    padding: '0.5rem',
                    background: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid hsl(var(--color-border))',
                    display: 'none', // Handle media query in style block
                }}
                className="sidebar-toggle"
            >
                <MenuIcon size={20} />
            </button>

            {/* Sidebar Overlay for Mobile */}
            {showSidebar && (
                <div
                    className="sidebar-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'transparent',
                        zIndex: 40, // Higher than sidebar (20) - WAIT, sidebar needs to be on TOP. Sidebar is z=50. So 40 is correct.
                        // Display handled by CSS class now
                    }}
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`chat-sidebar liquid-glass ${showSidebar ? 'open' : ''}`} style={{
                width: '260px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                flexShrink: 0,
                borderRight: '1px solid hsl(var(--color-border))',
                paddingRight: '1rem',
                transition: 'transform 0.3s ease',
                zIndex: 20
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={startNewChat}
                        className="button button-primary"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            border: '1px dashed hsl(var(--color-text-main))',
                            background: 'transparent',
                            color: 'hsl(var(--color-text-main))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(0,0,0,0.02)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                        <Plus size={18} /> {t('chat.newChat')}
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {historyLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                            <Loader2 className="spin" size={20} />
                        </div>
                    ) : !isAuthenticated ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem 1rem',
                            color: 'hsl(var(--color-text-muted))',
                            fontSize: '0.9rem',
                            background: 'hsl(var(--color-bg-secondary))',
                            borderRadius: '0.5rem',
                        }}>
                            <Lock size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p style={{ marginBottom: '1rem' }}>{t('chat.sidebar.loginPrompt')}</p>
                            <button
                                onClick={() => openAuthModal('login')}
                                style={{
                                    color: 'hsl(var(--color-text-main))',
                                    fontWeight: 600,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                {t('chat.sidebar.signIn')}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ padding: '0 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', textTransform: 'uppercase' }}>{t('chat.sidebar.recent')}</div>
                            {historyList.map(conv => (
                                <div
                                    key={conv.id}
                                    className="chat-history-item"
                                    style={{
                                        position: 'relative',
                                        textAlign: 'left',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        background: conversationId === conv.id ? 'hsl(var(--color-text-main) / 0.05)' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'background 0.2s ease',
                                        color: 'hsl(var(--color-text-main))',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Clickable Content Area - Loads Chat */}
                                    <div
                                        onClick={() => loadConversation(conv.id)}
                                        title={conv.title || t('chat.defaultTitle')} // Native Tooltip
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            flex: 1,
                                            minWidth: 0,
                                            height: '100%',
                                            position: 'relative',
                                            zIndex: 1
                                        }}
                                    >
                                        <MessageSquare size={16} style={{ opacity: 0.5, flexShrink: 0 }} />
                                        <div style={{
                                            flex: 1,
                                            minWidth: 0,
                                            marginRight: '0.5rem',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <div style={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontSize: '0.9rem'
                                            }}>
                                                {conv.title || t('chat.defaultTitle')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button Container - CSS Controlled Visibility */}
                                    <div
                                        className="delete-overlay"
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end', // Ensure button is at the end
                                            paddingRight: '0.5rem',
                                            width: '120px', // Fixed width for consistent gradient start
                                            background: 'linear-gradient(to right, transparent, var(--color-bg-primary, #ffffff) 60%)',
                                            zIndex: 10,
                                            backdropFilter: 'blur(6px)', // Deeper blur
                                            WebkitBackdropFilter: 'blur(6px)',
                                            maskImage: 'linear-gradient(to right, transparent, black 70%)', // Seamless fade-in of the blur/cover
                                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 70%)',
                                        }}
                                    >
                                        <button
                                            className="delete-btn-force" // Specific class to target pointer-events
                                            onClick={(e) => handleDeleteChat(e, conv.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '6px',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background 0.2s ease',
                                                pointerEvents: 'auto' // Always clickable if visible
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            title={t('common.delete', 'Delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <style>{`
                                .delete-overlay {
                                    opacity: 0;
                                    pointer-events: none;
                                    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* Slower, smoother fade */
                                }
                                .chat-history-item:hover .delete-overlay {
                                    opacity: 1;
                                    pointer-events: auto; 
                                }
                            `}</style>
                            {historyList.length === 0 && (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                                    {t('chat.sidebar.noHistory')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="liquid-glass animate-fade-in" style={{
                flex: 1,
                borderRadius: '1.5rem',
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                position: 'relative' // For loader
            }}>
                {historyLoading && (
                    <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Loader2 className="spin" size={32} />
                    </div>
                )}

                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {messages.map((msg, idx) => {
                        const isAi = msg.role === 'assistant';
                        return (
                            <div key={idx} style={{
                                display: 'flex',
                                gap: '1rem',
                                alignSelf: isAi ? 'flex-start' : 'flex-end',
                                flexDirection: isAi ? 'row' : 'row-reverse',
                                maxWidth: '85%'
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    borderRadius: '50%',
                                    background: isAi ? 'hsl(var(--color-accent) / 0.1)' : 'hsl(var(--color-text-main))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {isAi ? <Sparkles size={16} color="hsl(var(--color-accent))" /> : <User size={16} color="white" />}
                                </div>

                                {/* Bubble */}
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '1.25rem',
                                    borderTopLeftRadius: isAi ? '0.25rem' : '1.25rem',
                                    borderTopRightRadius: isAi ? '1.25rem' : '0.25rem',
                                    background: isAi ? 'rgba(255,255,255,0.5)' : 'hsl(var(--color-text-main))',
                                    color: isAi ? 'inherit' : 'white',
                                    lineHeight: '1.6',
                                    fontSize: '0.95rem',
                                    boxShadow: isAi ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ node, ...props }) => <p style={{ margin: 0, marginBottom: '0.5rem' }} {...props} />,
                                            ul: ({ node, ...props }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...props} />,
                                            ol: ({ node, ...props }) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...props} />,
                                            li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                                            strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} />
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        );
                    })}
                    {loading && (
                        <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start', maxWidth: '80%' }}>
                            <div style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '50%',
                                background: 'hsl(var(--color-accent) / 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Loader2 className="spin" size={14} color="hsl(var(--color-accent))" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} style={{
                    padding: '1.5rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    background: 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('chat.placeholder')}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '1rem 1.5rem',
                            borderRadius: '3rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            background: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '50%',
                            background: 'hsl(var(--color-text-main))',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: (loading || !input.trim()) ? 0.5 : 1
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                
                .sidebar-overlay { display: none; }

                @media (max-width: 768px) {
                    .chat-sidebar {
                        position: fixed;
                        top: 6rem;
                        bottom: 0;
                        left: 0;
                        z-index: 50;
                        background: hsl(var(--color-surface));
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                        width: 80% !important;
                        box-shadow: 10px 0 20px rgba(0,0,0,0.1);
                    }
                    .chat-sidebar.open {
                        transform: translateX(0);
                    }
                    .sidebar-toggle {
                        display: block !important;
                    }
                    .sidebar-overlay {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}
