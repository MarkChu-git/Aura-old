/**
 * @file AdminDashboard.jsx
 * @author Aura Team
 * @created 2024-01-01
 * @description The main dashboard for the admin area. Displays key statistics
 * (users, announcements) and provides quick access links to other admin management pages.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

/**
 * AdminDashboard Page Component.
 * 
 * Fetches and displays system-wide statistics including:
 * - Total users
 * - Active users
 * - Total announcements
 * - Active announcements
 * 
 * Also provides navigation buttons to specific management sections.
 * 
 * @component
 * @returns {JSX.Element} The AdminDashboard page
 */
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalAnnouncements: 0,
        activeAnnouncements: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch stats on mount
    useEffect(() => {
        loadStats();
    }, []);

    /**
     * Fetches statistics from the API.
     * Uses Promise.all to fetch users and announcements concurrently.
     * Calculates derived stats like 'active users' on the client side.
     */
    const loadStats = async () => {
        try {
            const [usersRes, announcementsRes] = await Promise.all([
                api.admin.getUsers(),
                api.admin.getAnnouncements()
            ]);

            const users = usersRes.data || [];
            const announcements = announcementsRes.data || [];

            setStats({
                totalUsers: users.length,
                activeUsers: users.filter(u => u.is_active).length,
                totalAnnouncements: announcements.length,
                activeAnnouncements: announcements.filter(a => a.is_active).length
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                Loading...
            </div>
        );
    }

    /**
     * Helper component to display a single statistic card.
     * 
     * @param {Object} props
     * @param {string} props.title - Title of the statistic
     * @param {number} props.value - Value to display
     * @param {string} props.color - Text color for the value
     */
    const StatCard = ({ title, value, color }) => (
        <div
            className="liquid-glass"
            style={{
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '1px solid hsl(var(--color-border))',
                background: 'hsl(var(--color-surface) / 0.6)'
            }}
        >
            <div
                style={{
                    fontSize: '1.1rem',
                    color: 'hsl(var(--color-text-muted))',
                    marginBottom: '0.5rem'
                }}
            >
                {title}
            </div>
            <div
                style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color
                }}
            >
                {value}
            </div>
        </div>
    );

    /**
     * Helper component for dashboard action buttons.
     * 
     * @param {Object} props
     * @param {Function} props.onClick - Click handler
     * @param {React.ReactNode} props.children - Button content
     * @param {string} props.color - Border color
     */
    const QuickAction = ({ onClick, children, color }) => (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                padding: '2rem 4rem',
                borderRadius: '1rem',
                border: `1px solid ${color}`,
                background: 'hsl(var(--color-surface) / 0.6)',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                color: 'hsl(var(--color-text-main))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            {children}
        </button>
    );

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
                    Admin Dashboard
                </h1>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '1.1rem' }}>
                    Overview and statistics
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    color="#3B82F6"
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    color="#10B981"
                />
                <StatCard
                    title="Announcements"
                    value={stats.totalAnnouncements}
                    color="#8B5CF6"
                />
                <StatCard
                    title="Active Announcements"
                    value={stats.activeAnnouncements}
                    color="#F59E0B"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <QuickAction
                    onClick={() => navigate('/admin/users')}
                    color="#3B82F6"
                >
                    Manage Users
                </QuickAction>
                <QuickAction
                    onClick={() => navigate('/admin/announcements')}
                    color="#8B5CF6"
                >
                    Manage Announcements
                </QuickAction>
            </div>
        </div>
    );
}
