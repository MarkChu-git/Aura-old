import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ArrowLeft, Plus, Trash2, Power, PowerOff, Eye, EyeOff, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content }) => {
    return (
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
            {content}
        </ReactMarkdown>
    );
};

export default function AdminAnnouncements() {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [creating, setCreating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const response = await api.admin.getAnnouncements();
            setAnnouncements(response.data || []);
        } catch (error) {
            console.error('Failed to load announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setCreating(true);
        try {
            await api.admin.createAnnouncement(formData.title, formData.content);
            setFormData({ title: '', content: '' });
            setShowCreateModal(false);
            await loadAnnouncements();
        } catch (error) {
            alert(error.message || 'Failed to create announcement');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        try {
            await api.admin.deleteAnnouncement(id);
            await loadAnnouncements();
        } catch (error) {
            alert(error.message || 'Failed to delete announcement');
        }
    };

    const handleToggle = async (id) => {
        try {
            await api.admin.toggleAnnouncement(id);
            await loadAnnouncements();
        } catch (error) {
            alert(error.message || 'Failed to toggle announcement');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading announcements...</div>;
    }

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                            Manage Announcements
                        </h1>
                        <p style={{ color: 'hsl(var(--color-text-muted))', margin: 0 }}>Create and manage site announcements</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'hsl(var(--color-text-main))',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 500,
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} />
                    New Announcement
                </button>
            </div>

            {announcements.length === 0 ? (
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
                    No announcements yet. Create your first announcement to get started.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {announcements.map(announcement => (
                        <div
                            key={announcement.id}
                            className="liquid-glass"
                            style={{
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: announcement.is_active
                                    ? 'hsl(var(--color-surface) / 0.8)'
                                    : 'hsl(var(--color-surface) / 0.4)',
                                opacity: announcement.is_active ? 1 : 0.6
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1, marginRight: '1rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {announcement.title}
                                    </h3>
                                    <div style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                                        {formatDate(announcement.created_at)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            background: announcement.is_active
                                                ? 'rgba(16, 185, 129, 0.1)'
                                                : 'rgba(239, 68, 68, 0.1)',
                                            color: announcement.is_active ? '#059669' : '#DC2626'
                                        }}
                                    >
                                        {announcement.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                    <button
                                        onClick={() => handleToggle(announcement.id)}
                                        title={announcement.is_active ? 'Deactivate' : 'Activate'}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '0.5rem',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            color: 'hsl(var(--color-text-main))',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = announcement.is_active ? '#F59E0B' : '#10B981';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = 'hsl(var(--color-border))';
                                        }}
                                    >
                                        {announcement.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        title="Delete"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '0.5rem',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            color: '#DC2626',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = '#DC2626';
                                            e.target.style.background = 'rgba(220, 38, 38, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = 'hsl(var(--color-border))';
                                            e.target.style.background = 'transparent';
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ color: 'hsl(var(--color-text-main))', lineHeight: 1.6 }}>
                                <MarkdownRenderer content={announcement.content} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
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
                            setShowCreateModal(false);
                            setFormData({ title: '', content: '' });
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
                            maxWidth: '600px',
                            width: '100%'
                        }}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create Announcement</h2>

                        {/* Tab Toggle - Edit / Preview */}
                        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--color-border))' }}>
                            <button
                                onClick={() => setShowPreview(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: !showPreview ? 'hsl(var(--color-surface))' : 'transparent',
                                    border: 'none',
                                    borderBottom: !showPreview ? '2px solid #667eea' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: !showPreview ? '600' : '400',
                                    color: 'hsl(var(--color-text-main))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <FileText size={16} />
                                Edit
                            </button>
                            <button
                                onClick={() => setShowPreview(true)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: showPreview ? 'hsl(var(--color-surface))' : 'transparent',
                                    border: 'none',
                                    borderBottom: showPreview ? '2px solid #667eea' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: showPreview ? '600' : '400',
                                    color: 'hsl(var(--color-text-main))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Eye size={16} />
                                Preview
                            </button>
                        </div>

                        {!showPreview ? (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Announcement title..."
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'hsl(var(--color-surface))',
                                            color: 'hsl(var(--color-text-main))',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                        Content <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'hsl(var(--color-text-muted))' }}>(Markdown supported)</span>
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="# Announcement content...

Supports Markdown:
- **Bold** and *italic*
- Lists
- Links
- And more!"
                                        rows={12}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'hsl(var(--color-surface))',
                                            color: 'hsl(var(--color-text-main))',
                                            fontSize: '1rem',
                                            resize: 'vertical',
                                            fontFamily: 'monospace',
                                            lineHeight: 1.6
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="liquid-glass" style={{
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                background: 'hsl(var(--color-surface) / 0.5)',
                                maxHeight: '400px',
                                overflowY: 'auto',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                                    {formData.title || 'Untitled'}
                                </h3>
                                <div style={{
                                    lineHeight: 1.8,
                                    color: 'hsl(var(--color-text-main))'
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
                                        {formData.content || '*Start typing to see preview...*'}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setFormData({ title: '', content: '' });
                                }}
                                disabled={creating}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid hsl(var(--color-border))',
                                    background: 'transparent',
                                    cursor: creating ? 'not-allowed' : 'pointer',
                                    color: 'hsl(var(--color-text-main))',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !formData.title.trim() || !formData.content.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: creating || !formData.title.trim() || !formData.content.trim()
                                        ? 'hsl(var(--color-text-muted))'
                                        : 'hsl(var(--color-text-main))',
                                    cursor: creating || !formData.title.trim() || !formData.content.trim()
                                        ? 'not-allowed'
                                        : 'pointer',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                {creating ? 'Creating...' : 'Create Announcement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
