/**
 * Authentication Context Module
 * -----------------------------
 * This module provides global authentication state and methods to the application.
 * It manages user login, logout, token storage, and profile fetching.
 *
 * @module context/AuthContext
 * @author Aura Team
 * @created 2024-01-01
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

/**
 * Authentication Provider Component.
 * Wraps the application to provide authentication state.
 * 
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 */
export const AuthProvider = ({ children }) => {
    // State initialization from localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    
    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

    /**
     * Fetch user profile from API.
     */
    const loadUser = useCallback(async () => {
        if (isAuthenticated) {
            setIsLoadingUser(true);
            try {
                const profile = await api.getProfile();
                setUser(profile);
            } catch (error) {
                console.error('Failed to load user profile:', error);
                // If profile load fails (e.g. invalid token), logout?
                // For now just set user null, might want to clear token if 401.
                setUser(null);
            } finally {
                setIsLoadingUser(false);
            }
        } else {
            setUser(null);
            setIsLoadingUser(false);
        }
    }, [isAuthenticated]);

    // Load user on mount or auth state change
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    /**
     * Log in the user.
     * 
     * @param {string} newToken - The JWT access token.
     */
    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
    };

    /**
     * Log out the user.
     * Clears token and resets state.
     */
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
    };

    /**
     * Manually refresh user profile data.
     */
    const refreshUser = async () => {
        if (isAuthenticated) {
            setIsLoadingUser(true);
            try {
                const profile = await api.getProfile();
                setUser(profile);
            } catch (error) {
                console.error('Failed to refresh user:', error);
            } finally {
                setIsLoadingUser(false);
            }
        }
    };

    /**
     * Open the authentication modal.
     * 
     * @param {string} [mode='login'] - The initial mode ('login' or 'register').
     */
    const openAuthModal = (mode = 'login') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };

    /**
     * Close the authentication modal.
     */
    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <AuthContext.Provider value={{
            token,
            isAuthenticated,
            user,
            isLoadingUser,
            login,
            logout,
            isAuthModalOpen,
            authModalMode,
            openAuthModal,
            closeAuthModal,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to use authentication context.
 * 
 * @returns {Object} Auth context value.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
