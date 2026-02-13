/**
 * Language Context Module
 * -----------------------
 * This module manages the application's language state.
 * It handles language switching and synchronization with the backend user profile.
 *
 * @module context/LanguageContext
 * @author Aura Team
 * @created 2024-01-01
 */

import { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const LanguageContext = createContext(null);

/**
 * Language Provider Component.
 * 
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 */
export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const { isAuthenticated } = useAuth();

    /**
     * Sync user's language preference from backend.
     */
    const syncLanguageWithBackend = async () => {
        try {
            const response = await api.getUserLanguage();
            if (response.language && response.language !== i18n.language) {
                await i18n.changeLanguage(response.language);
            }
        } catch (error) {
            console.error('Failed to sync language with backend:', error);
        }
    };

    // Sync language preference with backend when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            syncLanguageWithBackend();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    /**
     * Change application language.
     * Persists to localStorage and backend (if authenticated).
     * 
     * @param {string} lng - Language code (e.g., 'en', 'zh').
     */
    const changeLanguage = async (lng) => {
        await i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);

        // Save to backend if authenticated
        if (isAuthenticated) {
            try {
                await api.updateUserLanguage(lng);
            } catch (error) {
                console.error('Failed to save language preference:', error);
            }
        }
    };

    return (
        <LanguageContext.Provider value={{
            currentLanguage: i18n.language,
            changeLanguage
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * Hook to use language context.
 * 
 * @returns {Object} Language context value.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
