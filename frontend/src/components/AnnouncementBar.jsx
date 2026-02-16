/**
 * Announcement Bar Component
 * --------------------------
 * A simplified version of the announcement display, typically used for single critical alerts.
 * Listens for storage events to sync dismissal across tabs.
 *
 * @component
 */

import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { X, Info } from 'lucide-react';

export default function AnnouncementBar() {
    const [announcement, setAnnouncement] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadAnnouncement = async () => {
            try {
                const response = await api.getActiveAnnouncements();
                if (!mounted) return;

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

        loadAnnouncement();

        // Listen for dismissal in other tabs/components
        const handleStorage = (e) => {
            if (e.key === 'announcement-dismissed') {
                setDismissed(true);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => {
            mounted = false;
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    /**
     * Dismiss the current announcement.
     */
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
        <div
            style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                zIndex: 50
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
            <div
                onClick={handleDismiss}
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
                <X size={18} />
            </div>
        </div>
    );
}
