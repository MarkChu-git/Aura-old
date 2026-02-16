/**
 * Chat Page Component
 * -------------------
 * The main chat interface. Features:
 * - Real-time chat with AI
 * - Sidebar with conversation history
 * - Markdown rendering for messages
 * - Code syntax highlighting
 * - Mobile responsive layout
 *
 * @component
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, User, Sparkles, Loader2, MessageSquare, Plus, Menu as MenuIcon, Lock, Trash2, Copy, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('yaml', yaml);

/**
 * CodeBlock Component
 * Renders code snippets with syntax highlighting and copy functionality.
 */
function CodeBlock({ language, children }) {
    const [copied, setCopied] = useState(false);
    const normalizedLanguage = (() => {
        const lang = (language || '').toLowerCase();
        const map = {
            js: 'javascript',
            jsx: 'jsx',
            ts: 'typescript',
            tsx: 'tsx',
            py: 'python',
            sh: 'bash',
            shell: 'bash',
            yml: 'yaml',
        };
        return map[lang] || lang || 'text';
    })();

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: 'relative', margin: '1rem 0', borderRadius: '0.5rem', overflow: 'hidden', width: '100%', maxWidth: '650px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                background: '#282c34',
                color: '#abb2bf',
                fontSize: '0.8rem',
                borderBottom: '1px solid #3e4451'
            }}>
                <span>{language || 'code'}</span>
                <button
                    onClick={handleCopy}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.8rem'
                    }}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <SyntaxHighlighter
                language={normalizedLanguage}
                style={oneDark}
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.9rem', maxWidth: '100%', overflowX: 'auto' }}
                wrapLines={true}
            >
                {children}
            </SyntaxHighlighter>
        </div>
    );
}

/**
 * MessageBubble Component
 * Renders a single chat message (user or AI) with Markdown support.
 */
function MessageBubble({ msg, isAi }) {
    const [copied, setCopied] = useState(false);

    const handleCopyMessage = () => {
        navigator.clipboard.writeText(msg.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '1.25rem',
            borderTopLeftRadius: isAi ? '0.25rem' : '1.25rem',
            borderTopRightRadius: isAi ? '1.25rem' : '0.25rem',
            background: isAi ? 'white' : 'hsl(var(--color-text-main))',
            color: isAi ? 'hsl(var(--color-text-main))' : 'white',
            lineHeight: '1.6',
            fontSize: '0.95rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: isAi ? '1px solid rgba(0,0,0,0.08)' : 'none',
            position: 'relative',
            group: 'message-bubble' // Identifier for hover effect
        }}
            className="message-bubble-container"
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ ...props }) => <p style={{ margin: 0, marginBottom: '0.5rem' }} {...props} />,
                    ul: ({ ...props }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...props} />,
                    ol: ({ ...props }) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...props} />,
                    li: ({ ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                    strong: ({ ...props }) => <strong style={{ fontWeight: 600 }} {...props} />,
                    code: ({ inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <CodeBlock language={match[1]}>
                                {String(children).replace(/\n$/, '')}
                            </CodeBlock>
                        ) : (
                            <code className={className} style={{
                                background: 'rgba(0, 0, 0, 0.1)',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.85em',
                                fontFamily: 'monospace'
                            }} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {msg.content}
            </ReactMarkdown>
            
            <button
                onClick={handleCopyMessage}
                className="message-copy-btn"
                style={{
                    position: 'absolute',
                    bottom: '-1.5rem',
                    right: isAi ? '0' : 'auto',
                    left: isAi ? 'auto' : '0',
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(var(--color-text-muted))',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    padding: '0.25rem'
                }}
            >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        </div>
    );
}

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
    const loadingConversationRef = useRef(false);

    // Helper functions defined before useEffect to avoid initialization issues
    const loadConversation = useCallback(async (id) => {
        if (loadingConversationRef.current) return;
        loadingConversationRef.current = true;
        setHistoryLoading(true);
        try {
            const msgs = await api.getConversation(id);
            // Format DB messages to UI format
            const formatted = msgs.map(m => ({ role: m.role, content: m.content }));

            setMessages(formatted);
            setConversationId(id);
            if (window.innerWidth < 768) setShowSidebar(false); // Auto close on mobile
        } catch (err) {
            console.error("Failed to load conversation", err);
        } finally {
            setHistoryLoading(false);
            loadingConversationRef.current = false;
        }
    }, []);

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
        }
    }, [location.state, isAuthenticated, loadConversation]);

    // Update welcome message when language changes if it's the only message
    useEffect(() => {
        const newContent = t('chat.welcomeMessage');
        setMessages(prevMessages => {
            // Only update if there's exactly one message and it's from the assistant
            // This indicates it's likely the welcome message
            if (prevMessages.length === 1 && prevMessages[0].role === 'assistant') {
                return [{ role: 'assistant', content: newContent }];
            }
            return prevMessages;
        });
    }, [t, i18n.language]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    /**
     * Reset chat state for a new conversation.
     */
    const startNewChat = () => {
        setConversationId(null);
        setMessages([
            { role: 'assistant', content: t('chat.welcomeMessage') }
        ]);
        if (window.innerWidth < 768) setShowSidebar(false);
    };

    /**
     * Delete a conversation.
     * @param {Event} e - Click event.
     * @param {string} id - Conversation ID.
     */
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

    /**
     * Handle sending a new message.
     * @param {Event} e - Form submit event.
     */
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
            if (isAuthenticated) {
                // Poll for AI Title generation
                setTimeout(fetchHistory, 2000);
                setTimeout(fetchHistory, 5000);
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : '';
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: errorMessage ? errorMessage : t('chat.error') }
            ]);
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
                        zIndex: 40,
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
                                    onClick={() => loadConversation(conv.id)}
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
                                    pointer-events: none; /* KEY FIX: Never block clicks on the item behind it */
                                    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                }
                                .chat-history-item:hover .delete-overlay {
                                    opacity: 1;
                                }
                                /* Mobile Sync: Force delete button visibility on touch devices */
                                @media (max-width: 768px) {
                                    .delete-overlay {
                                        opacity: 1 !important; /* Always show on mobile */
                                        background: linear-gradient(to right, transparent, hsl(var(--color-surface)) 80%); /* cleaner fade */
                                        width: auto !important;
                                        padding-left: 1rem;
                                    }
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
                                <MessageBubble msg={msg} isAi={isAi} />
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
                
                .chat-sidebar {
                    z-index: 20; /* Default desktop z-index */
                }

                @media (max-width: 768px) {
                    .chat-sidebar {
                        /* Prioritize mobile visibility over overlay */
                        z-index: 50;
                        position: fixed;
                        top: 6rem;
                        bottom: 0;
                        left: 0;
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

            .message-bubble-container:hover .message-copy-btn {
                opacity: 1 !important;
            }
        `}</style>
    </div>
);
}
