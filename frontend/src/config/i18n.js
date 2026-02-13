/**
 * i18n Configuration Module
 * -------------------------
 * Configures i18next for internationalization.
 * Sets up language detection, resource loading, and default fallbacks.
 *
 * @module config/i18n
 * @author Aura Team
 * @created 2024-01-01
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import zh from '../locales/zh.json';
import ms from '../locales/ms.json';

i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Init i18next
    .init({
        resources: {
            en: { translation: en },
            zh: { translation: zh },
            ms: { translation: ms }
        },
        fallbackLng: 'en',
        debug: false,
        
        interpolation: {
            escapeValue: false // React already escapes values
        },
        
        detection: {
            // Order of detection
            order: ['localStorage', 'navigator'],
            // Cache user language in localStorage
            caches: ['localStorage']
        }
    });

export default i18n;
