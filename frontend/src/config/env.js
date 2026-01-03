/**
 * Centralized configuration module for environment variables.
 * Uses Vite's import.meta.env for loading.
 */

const env = {
    // Parsing the base URL with a safe default for local development
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/v1',

    // Helper to check if we are in dev mode
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
};

export default env;
