import { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const { isAuthenticated } = useAuth();

    // Sync language preference with backend when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            syncLanguageWithBackend();
        }
    }, [isAuthenticated]);

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

export const useLanguage = () => useContext(LanguageContext);
