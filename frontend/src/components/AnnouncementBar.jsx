import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { X, Info } from 'lucide-react';
import LiquidGlass from 'liquid-glass-react';

export default function AnnouncementBar() {
    const [announcement, setAnnouncement] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        loadAnnouncement();
        
        const handleStorage = (e) => {
            if (e.key === 'announcement-dismissed') {
                setDismissed(true);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const loadAnnouncement = async () => {
        try {
            const response = await api.getActiveAnnouncements();
            const announcements = response.data || [];
            
            if (announcements.length > 0) {
                const dismissedAnnouncements = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
                const latestActive = announcements.find(a => 
                    a.is_active && !dismissedAnnouncements.includes(a.id)
                );
                setAnnouncement(latestActive);
            }
        } catch (error) {
            console.error('Failed to load announcement:', error);
        }
    };

    const handleDismiss = () => {
        if (!announcement) return;
        
        const dismissedAnnouncements = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
        if (!dismissedAnnouncements.includes(announcement.id)) {
            dismissedAnnouncements.push(announcement.id);
            localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedAnnouncements));
        }
        setDismissed(true);
    };

    if (dismissed || !announcement) {
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
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                position: 'relative'
            }}
        >
            <Info size={20} style={{ flexShrink: 0, color: '#667eea' }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {announcement.title}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {announcement.content}
                </div>
            </div>
            <LiquidGlass
                displacementScale={70}
                blurAmount={0.0625}
                overLight={true}
                elasticity={0.15}
                cornerRadius={8}
                padding="0.25rem"
                onClick={handleDismiss}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
            >
                <X size={18} />
            </LiquidGlass>
        </LiquidGlass>
    );
}
