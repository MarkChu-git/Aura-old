import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MessageSquare, Check, X } from 'lucide-react';

export default function UserMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const response = await api.getMessages();
            setMessages(response.data || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (messageId) => {
        try {
            await api.markMessageRead(messageId);
            setMessages(messages.map(m =>
                m.id === messageId ? { ...m, is_read: true } : m
            ));
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    const handleClose = async (messageId) => {
        try {
            await api.markMessageRead(messageId);
            setMessages(messages.filter(m => m.id !== messageId));
        } catch (error) {
            console.error('Failed to close message:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return null;
    }

    if (messages.length === 0) {
        return null;
    }

    const unreadMessages = messages.filter(m => !m.is_read);

    return (
        <div style={{ marginBottom: '2rem' }}>
            {unreadMessages.length > 0 && (
                <div style={{
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'hsl(var(--color-text-muted))',
                }}>
                    {unreadMessages.length} unread message{unreadMessages.length !== 1 ? 's' : ''}
                </div>
            )}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {messages.map(message => (
                    <div
                        key={message.id}
                        className="liquid-glass"
                        style={{
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            border: '1px solid',
                            borderColor: message.is_read
                                ? 'hsl(var(--color-border))'
                                : 'rgba(102, 126, 234, 0.3)',
                            background: message.is_read
                                ? 'hsl(var(--color-surface) / 0.6)'
                                : 'rgba(102, 126, 234, 0.05)',
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'flex-start'
                        }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '0.75rem',
                                background: message.is_read
                                    ? 'hsl(var(--color-text-muted) / 0.1)'
                                    : 'rgba(102, 126, 234, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <MessageSquare
                                size={20}
                                color={message.is_read
                                    ? 'hsl(var(--color-text-muted))'
                                    : '#667eea'
                                }
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p
                                style={{
                                    margin: 0,
                                    color: 'hsl(var(--color-text-main))',
                                    lineHeight: 1.6,
                                    marginBottom: '0.5rem'
                                }}
                            >
                                {message.content}
                            </p>
                            <div
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'hsl(var(--color-text-muted))'
                                }}
                            >
                                {formatDate(message.created_at)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {!message.is_read && (
                                <button
                                    onClick={() => handleMarkAsRead(message.id)}
                                    title="Mark as read"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '0.5rem',
                                        border: '1px solid hsl(var(--color-border))',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: '#059669',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#059669';
                                        e.target.style.background = 'rgba(5, 150, 105, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = 'hsl(var(--color-border))';
                                        e.target.style.background = 'transparent';
                                    }}
                                >
                                    <Check size={16} />
                                </button>
                            )}
                            <button
                                onClick={() => handleClose(message.id)}
                                title="Close"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '0.5rem',
                                    border: '1px solid hsl(var(--color-border))',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: 'hsl(var(--color-text-muted))',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#DC2626';
                                    e.target.style.color = '#DC2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = 'hsl(var(--color-border))';
                                    e.target.style.color = 'hsl(var(--color-text-muted))';
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
