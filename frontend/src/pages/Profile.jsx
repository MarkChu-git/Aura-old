import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, LogOut, Clock, Bookmark, Settings, Trash2, ChevronRight, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [saved, setSaved] = useState([]); // Mocked for now

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [error, setError] = useState('');

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        } else {
            setLoadingProfile(false);
            setLoadingHistory(false);
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            const [profileData, historyData] = await Promise.all([
                api.getProfile(),
                api.getHistory()
            ]);
            setUser(profileData);
            setHistory(historyData);
        } catch (err) {
            console.error(err);
            setError("Failed to load profile data.");
        } finally {
            setLoadingProfile(false);
            setLoadingHistory(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm("Clear your history? This will delete your exploration history from this device/account.")) return;
        try {
            await api.clearHistory();
            setHistory([]);
        } catch (err) {
            alert("Failed to clear history");
        }
    };

    const handleClearSaved = () => {
        if (!confirm("Clear saved items? This will remove all items from your Saved list.")) return;
        setSaved([]);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 10) {
            setPasswordError('Password must be at least 10 characters');
            return;
        }

        setChangingPassword(true);
        try {
            await api.changePassword({ old_password: oldPassword, new_password: newPassword });
            setPasswordSuccess('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (err) {
            setPasswordError(err.response?.data?.detail || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    if (!isAuthenticated) return (
        <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Please Sign In</h2>
            <p style={{ color: 'hsl(var(--color-text-muted))', marginBottom: '1.5rem' }}>You need to be logged in to view your profile.</p>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', background: 'hsl(var(--color-text-main))', color: '#fff' }}>Go to Login</button>
        </div>
    );

    if (loadingProfile) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

    const Section = ({ title, icon: Icon, children }) => (
        <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Icon size={20} color="hsl(var(--color-text-muted))" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
            </div>
            {children}
        </section>
    );

    const Card = ({ children, style }) => (
        <div className="liquid-glass" style={{
            padding: '1.5rem',
            borderRadius: '1.5rem',
            border: '1px solid hsl(var(--color-border))',
            background: 'hsl(var(--color-surface) / 0.6)',
            ...style
        }}>
            {children}
        </div>
    );

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Profile</h1>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '1.1rem' }}>Your account, history, and saved items</p>
            </div>

            {/* Account Section */}
            <Section title="Account" icon={User}>
                <Card style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))', marginBottom: '0.5rem' }}>Email</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>{user?.email}</div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                                Active Member
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #FECACA',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </Card>
            </Section>

            {/* History Section */}
            <Section title="History" icon={Clock}>
                {history.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ background: 'hsl(var(--color-text-main) / 0.05)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Clock size={24} color="hsl(var(--color-text-muted))" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No exploration history yet</h3>
                        <p style={{ color: 'hsl(var(--color-text-muted))', marginBottom: '1.5rem' }}>Start exploring to see your history here.</p>
                        <Link to="/explore" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '2rem', background: 'hsl(var(--color-text-main))', color: '#fff' }}>
                            Go to Explore
                        </Link>
                    </Card>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {history.map(item => (
                            <Card key={item.id} style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' }}>
                                <div style={{ minWidth: 0, paddingRight: '1rem' }}>
                                    <h4 style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.title || "Untitled Chat"}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))' }}>
                                        {/* Assumed text input for now */}
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FileText size={12} /> Text</span>
                                        <span>{formatDate(item.created_at || item.updated_at)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/chat', { state: { conversationId: item.id } })} // Note: Chat needs to handle this state!
                                    style={{
                                        flexShrink: 0,
                                        padding: '0.5rem 1rem',
                                        borderRadius: '2rem',
                                        border: '1px solid hsl(var(--color-border))',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        color: 'hsl(var(--color-text-main))'
                                    }}
                                >
                                    Open Result
                                </button>
                            </Card>
                        ))}
                    </div>
                )}
            </Section>

            {/* Saved Section */}
            <Section title="Saved" icon={Bookmark}>
                {saved.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ background: 'hsl(var(--color-text-main) / 0.05)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Bookmark size={24} color="hsl(var(--color-text-muted))" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No saved items yet</h3>
                        <p style={{ color: 'hsl(var(--color-text-muted))', marginBottom: '1.5rem' }}>Save results or items to keep them here.</p>
                        <Link to="/explore" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '2rem', background: 'hsl(var(--color-text-main))', color: '#fff' }}>
                            Go to Explore
                        </Link>
                    </Card>
                ) : (
                    <div>{/* Placeholder for saved items list */}</div>
                )}
            </Section>

            {/* Security Section */}
            <Section title="Security" icon={Settings}>
                <Card>
                    {passwordSuccess && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#059669',
                            borderRadius: '0.75rem',
                            fontSize: '0.9rem'
                        }}>
                            {passwordSuccess}
                        </div>
                    )}

                    {!showPasswordForm ? (
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.75rem',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'hsl(var(--color-text-main))',
                                fontSize: '0.9rem',
                                width: '100%',
                                justifyContent: 'space-between'
                            }}
                        >
                            <span>Change Password</span>
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Change Your Password</h3>
                                {passwordError && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#EF4444',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.85rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <AlertCircle size={16} />
                                        {passwordError}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'hsl(var(--color-surface))',
                                            fontSize: '1rem'
                                        }}
                                        disabled={changingPassword}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'hsl(var(--color-surface))',
                                            fontSize: '1rem'
                                        }}
                                        disabled={changingPassword}
                                    />
                                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', marginTop: '0.25rem' }}>
                                        At least 10 characters with uppercase, lowercase, number, and special character
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'hsl(var(--color-surface))',
                                            fontSize: '1rem'
                                        }}
                                        disabled={changingPassword}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            background: 'hsl(var(--color-text-main))',
                                            color: '#fff',
                                            cursor: changingPassword ? 'not-allowed' : 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            opacity: changingPassword ? 0.6 : 1
                                        }}
                                    >
                                        {changingPassword ? 'Saving...' : 'Save New Password'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setOldPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setPasswordError('');
                                        }}
                                        disabled={changingPassword}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid hsl(var(--color-border))',
                                            background: 'transparent',
                                            cursor: changingPassword ? 'not-allowed' : 'pointer',
                                            fontSize: '0.9rem',
                                            color: 'hsl(var(--color-text-main))'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </Card>
            </Section>

            {/* Data Controls */}
            <Section title="Data Controls" icon={Settings}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleClearHistory}
                        disabled={history.length === 0}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'transparent',
                            cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                            opacity: history.length === 0 ? 0.5 : 1,
                            color: 'hsl(var(--color-text-main))',
                            fontSize: '0.9rem'
                        }}
                    >
                        <Trash2 size={16} />
                        Clear History
                    </button>
                    <button
                        onClick={handleClearSaved}
                        disabled={saved.length === 0}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'transparent',
                            cursor: saved.length === 0 ? 'not-allowed' : 'pointer',
                            opacity: saved.length === 0 ? 0.5 : 1,
                            color: 'hsl(var(--color-text-main))',
                            fontSize: '0.9rem'
                        }}
                    >
                        <Trash2 size={16} />
                        Clear Saved
                    </button>
                </div>
            </Section>
        </div>
    );
}
