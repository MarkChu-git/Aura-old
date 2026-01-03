import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2, MessageSquare, Plus, Menu as MenuIcon, Lock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chat() {
    const { isAuthenticated, openAuthModal } = useAuth();
    const location = useLocation();

    // State
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello. I am Aura. Tell me about a memory, a mood, or a place, and I will describe its scent.' }
    ]);
    const [conversationId, setConversationId] = useState(null);
    const [historyList, setHistoryList] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true); // Toggle for mobile

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
            { role: 'assistant', content: 'Hello. I am Aura. Tell me about a memory, a mood, or a place, and I will describe its scent.' }
        ]);
        if (window.innerWidth < 768) setShowSidebar(false);
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
                // Refresh history list to show the new item
                if (isAuthenticated) fetchHistory();
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble sensing that right now. Please try again." }]);
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

            {/* Sidebar */}
            <div className={`chat-sidebar liquid-glass ${showSidebar ? 'open' : ''}`} style={{
                width: '300px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                flexShrink: 0,
                // height: '100%' // fill container
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={startNewChat}
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
                        <Plus size={18} /> New Chat
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {!isAuthenticated ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem 1rem',
                            color: 'hsl(var(--color-text-muted))',
                            fontSize: '0.9rem'
                        }}>
                            <Lock size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p style={{ marginBottom: '1rem' }}>Log in to save your fragrance journey and view history.</p>
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
                                Sign In
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ padding: '0 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', textTransform: 'uppercase' }}>Recent</div>
                            {historyList.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => loadConversation(conv.id)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        background: conversationId === conv.id ? 'hsl(var(--color-text-main) / 0.05)' : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        transition: 'background 0.2s ease',
                                        color: 'hsl(var(--color-text-main))'
                                    }}
                                >
                                    <MessageSquare size={16} style={{ opacity: 0.5 }} />
                                    <span style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontSize: '0.9rem'
                                    }}>
                                        {conv.title || "New Chat"}
                                    </span>
                                </button>
                            ))}
                            {historyList.length === 0 && (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                                    No history yet. Start exploring!
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
                        placeholder="Type your thoughts..."
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
                }
            `}</style>
        </div>
    );
}
