import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

 export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    const loadUser = useCallback(async () => {
        if (isAuthenticated) {
            setIsLoadingUser(true);
            try {
                const profile = await api.getProfile();
                setUser(profile);
            } catch (error) {
                console.error('Failed to load user profile:', error);
                setUser(null);
            } finally {
                setIsLoadingUser(false);
            }
        } else {
            setUser(null);
            setIsLoadingUser(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
    };

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

    const openAuthModal = (mode = 'login') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

