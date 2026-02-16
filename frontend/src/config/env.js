/**
 * Environment Configuration Module
 * --------------------------------
 * Centralized access to environment variables.
 * Wraps Vite's import.meta.env to provide a clean API for config values.
 *
 * @module config/env
 * @author Aura Team
 * @created 2024-01-01
 */

const env = {
    /**
     * Base URL for the backend API.
     * Defaults to '/v1' for local development proxying.
     */
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/v1',

    /**
     * Flag indicating if the app is running in development mode.
     */
    isDev: import.meta.env.DEV,

    /**
     * Flag indicating if the app is running in production mode.
     */
    isProd: import.meta.env.PROD
};

export default env;
