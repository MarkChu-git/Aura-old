import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ArrowLeft, Search, Shield, ShieldOff, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.admin.getUsers();
            setUsers(response.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId, isActive) => {
        if (!confirm(`Are you sure you want to ${isActive ? 'ban' : 'unban'} this user?`)) return;

        try {
            if (isActive) {
                await api.admin.banUser(userId);
            } else {
                await api.admin.unbanUser(userId);
            }
            await loadUsers();
        } catch (error) {
            console.error('Failed to update user status:', error);
            alert(error.message || 'Failed to update user status');
        }
    };

    const handleSendMessage = async () => {
        if (!messageContent.trim()) return;

        setSendingMessage(true);
        try {
            await api.admin.sendMessage(selectedUser.id, messageContent);
            setMessageContent('');
            setShowMessageModal(false);
            setSelectedUser(null);
            alert('Message sent successfully');
        } catch (error) {
            alert(error.message || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const UserAvatar = ({ user }) => {
        if (user.picture_url) {
            return <img src={user.picture_url} alt={user.name || user.email} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />;
        }
        const initials = user.name
            ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : user.email[0].toUpperCase();
        return (
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'hsl(var(--color-text-main) / 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 600
            }}>
                {initials}
            </div>
        );
    };

    if (loading) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading users...</div>;
    }

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => navigate('/admin')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid hsl(var(--color-border))',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'hsl(var(--color-text-main))'
                    }}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <div>
                    <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.25rem', margin: 0 }}>
                        Manage Users
                    </h1>
                    <p style={{ color: 'hsl(var(--color-text-muted))', margin: 0 }}>View, manage, and communicate with users</p>
                </div>
            </div>

            <div
                className="liquid-glass"
                style={{
                    padding: '1rem',
                    borderRadius: '1rem',
                    border: '1px solid hsl(var(--color-border))',
                    background: 'hsl(var(--color-surface) / 0.6)',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                <Search size={20} color="hsl(var(--color-text-muted))" />
                <input
                    type="text"
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '1rem',
                        color: 'hsl(var(--color-text-main))',
                        outline: 'none'
                    }}
                />
            </div>

            {filteredUsers.length === 0 ? (
                <div
                    className="liquid-glass"
                    style={{
                        padding: '3rem',
                        borderRadius: '1.5rem',
                        border: '1px solid hsl(var(--color-border))',
                        background: 'hsl(var(--color-surface) / 0.6)',
                        textAlign: 'center',
                        color: 'hsl(var(--color-text-muted))'
                    }}
                >
                    No users found
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            className="liquid-glass"
                            style={{
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'hsl(var(--color-surface) / 0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem'
                            }}
                        >
                            <UserAvatar user={user} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {user.name || 'No name'}
                                </div>
                                <div style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                                    {user.email}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Shield size={14} />
                                        {user.role}
                                    </span>
                                    <span>•</span>
                                    <span>{formatDate(user.created_at)}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        background: user.is_active
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'rgba(239, 68, 68, 0.1)',
                                        color: user.is_active ? '#059669' : '#DC2626'
                                    }}
                                >
                                    {user.is_active ? 'Active' : 'Banned'}
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setShowMessageModal(true);
                                    }}
                                    title="Send message"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '0.5rem',
                                        border: '1px solid hsl(var(--color-border))',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: 'hsl(var(--color-text-main))',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#3B82F6';
                                        e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = 'hsl(var(--color-border))';
                                        e.target.style.background = 'transparent';
                                    }}
                                >
                                    <MessageSquare size={18} />
                                </button>
                                <button
                                    onClick={() => handleBan(user.id, user.is_active)}
                                    title={user.is_active ? 'Ban user' : 'Unban user'}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '0.5rem',
                                        border: '1px solid hsl(var(--color-border))',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: user.is_active ? '#DC2626' : '#059669',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = user.is_active ? '#DC2626' : '#059669';
                                        e.target.style.background = user.is_active ? 'rgba(220, 38, 38, 0.1)' : 'rgba(5, 150, 105, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = 'hsl(var(--color-border))';
                                        e.target.style.background = 'transparent';
                                    }}
                                >
                                    {user.is_active ? <ShieldOff size={18} /> : <Shield size={18} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showMessageModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowMessageModal(false);
                            setMessageContent('');
                            setSelectedUser(null);
                        }
                    }}
                >
                    <div
                        className="liquid-glass"
                        style={{
                            padding: '2rem',
                            borderRadius: '1.5rem',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'hsl(var(--color-surface) / 0.95)',
                            maxWidth: '500px',
                            width: '100%'
                        }}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Send Message</h2>
                        <p style={{ color: 'hsl(var(--color-text-muted))', marginBottom: '1.5rem' }}>
                            To: {selectedUser?.name || selectedUser?.email}
                        </p>
                        <textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Type your message here..."
                            rows={5}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'hsl(var(--color-surface))',
                                color: 'hsl(var(--color-text-main))',
                                fontSize: '1rem',
                                resize: 'vertical',
                                marginBottom: '1.5rem'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setMessageContent('');
                                    setSelectedUser(null);
                                }}
                                disabled={sendingMessage}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid hsl(var(--color-border))',
                                    background: 'transparent',
                                    cursor: sendingMessage ? 'not-allowed' : 'pointer',
                                    color: 'hsl(var(--color-text-main))',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !messageContent.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: sendingMessage || !messageContent.trim()
                                        ? 'hsl(var(--color-text-muted))'
                                        : 'hsl(var(--color-text-main))',
                                    cursor: sendingMessage || !messageContent.trim()
                                        ? 'not-allowed'
                                        : 'pointer',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                {sendingMessage ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
