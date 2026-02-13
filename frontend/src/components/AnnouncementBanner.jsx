/**
 * Announcement Banner Component
 * -----------------------------
 * A dismissible banner that displays system announcements at the top of the page.
 * Supports multiple announcements and cycles through them.
 * Persists dismissed state to localStorage.
 *
 * @component
 */

import { useEffect, useState, useCallback } from 'react';
import { X, Megaphone } from 'lucide-react';
import { api } from '../services/api.js';

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState([]);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState(() => JSON.parse(localStorage.getItem('dismissedAnnouncements') || '{}'));

    /**
     * Fetch active announcements from the API.
     * Filters out already dismissed announcements.
     */
    const loadAnnouncements = useCallback(async () => {
        try {
            const response = await api.getActiveAnnouncements();
            const activeAnnouncements = response.data || [];
            // Read fresh from local storage to ensure accuracy
            const dismissedData = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '{}');
            // Check as object keys since that is the storage format used here
            const filtered = activeAnnouncements.filter(a => !dismissedData[a.id]);
            setAnnouncements(filtered);
            if (filtered.length > 0) {
                setCurrentAnnouncement(filtered[0]);
            }
        } catch (error) {
            console.error('Failed to load announcements:', error);
        }
    }, []);

    useEffect(() => {
        loadAnnouncements();
    }, [loadAnnouncements]);

    /**
     * Handle dismissal of an announcement.
     * Updates localStorage and state.
     * 
     * @param {number} id - The announcement ID.
     */
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
                padding: '1rem',
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                zIndex: 40
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
                <Megaphone size={24} style={{ flexShrink: 0, color: '#667eea' }} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                        {currentAnnouncement.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        {currentAnnouncement.content}
                    </div>
                </div>
                {announcements.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
                        {announcements.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setCurrentAnnouncement(announcements[idx]);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: idx === currentIndex ? 'rgba(102, 126, 234, 0.9)' : 'rgba(102, 126, 234, 0.3)',
                                    transition: 'all 0.2s',
                                    border: '1px solid rgba(255, 255, 255, 0.5)'
                                }}
                            />
                        ))}
                    </div>
                )}
                <div
                    onClick={() => handleDismiss(currentAnnouncement.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
                >
                    <X size={20} />
                </div>
            </div>
        </div>
    );
}
