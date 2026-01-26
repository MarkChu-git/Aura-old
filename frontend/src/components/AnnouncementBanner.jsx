import { useEffect, useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import { api } from '../services/api';

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState([]);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState({});

    useEffect(() => {
        loadAnnouncements();
        loadDismissedAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const response = await api.getActiveAnnouncements();
            const activeAnnouncements = response.data || [];
            const dismissedIds = loadDismissedAnnouncements();
            const filtered = activeAnnouncements.filter(a => !dismissedIds.includes(a.id));
            setAnnouncements(filtered);
            if (filtered.length > 0) {
                setCurrentAnnouncement(filtered[0]);
            }
        } catch (error) {
            console.error('Failed to load announcements:', error);
        }
    };

    const loadDismissedAnnouncements = () => {
        const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '{}');
        setDismissed(dismissed);
        return dismissed;
    };

    const handleDismiss = (id) => {
        const newDismissed = { ...dismissed, [id]: true };
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
        setDismissed(newDismissed);

        const remaining = announcements.filter(a => a.id !== id);
        setAnnouncements(remaining);

        if (remaining.length > 0 && currentAnnouncement?.id === id) {
            const newIndex = currentIndex % remaining.length;
            setCurrentAnnouncement(remaining[newIndex]);
        } else if (remaining.length === 0) {
            setCurrentAnnouncement(null);
        }
    };

    if (!currentAnnouncement || announcements.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                padding: '1rem',
                position: 'relative',
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
                <Megaphone size={24} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                        {currentAnnouncement.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        {currentAnnouncement.content}
                    </div>
                </div>
                {announcements.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.25rem', marginRight: '0.5rem' }}>
                        {announcements.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setCurrentAnnouncement(announcements[idx]);
                                }}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: idx === currentIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            />
                        ))}
                    </div>
                )}
                <button
                    onClick={() => handleDismiss(currentAnnouncement.id)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.25rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
