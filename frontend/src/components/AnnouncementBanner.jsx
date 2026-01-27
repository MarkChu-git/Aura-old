import { useEffect, useState, useCallback } from 'react';
import { X, Megaphone } from 'lucide-react';
import { api } from '../services/api.js';
import LiquidGlass from 'liquid-glass-react';

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState([]);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState(() => JSON.parse(localStorage.getItem('dismissedAnnouncements') || '{}'));

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAnnouncements();
    }, [loadAnnouncements]);

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
        <LiquidGlass
            displacementScale={70}
            blurAmount={0.0625}
            overLight={true}
            elasticity={0.15}
            style={{
                padding: '1rem',
                position: 'relative',
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
                            <LiquidGlass
                                key={idx}
                                displacementScale={70}
                                blurAmount={0.0625}
                                overLight={true}
                                elasticity={0.15}
                                cornerRadius={999}
                                padding="4px"
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setCurrentAnnouncement(announcements[idx]);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    width: '8px',
                                    height: '8px',
                                    background: idx === currentIndex ? 'rgba(102, 126, 234, 0.8)' : 'rgba(102, 126, 234, 0.3)'
                                }}
                            />
                        ))}
                    </div>
                )}
                <LiquidGlass
                    displacementScale={70}
                    blurAmount={0.0625}
                    overLight={true}
                    elasticity={0.15}
                    cornerRadius={8}
                    padding="0.25rem"
                    onClick={() => handleDismiss(currentAnnouncement.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </LiquidGlass>
            </div>
        </LiquidGlass>
    );
}
