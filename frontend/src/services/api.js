/**
 * API Service Module
 * ------------------
 * This module handles all network requests to the backend API.
 * It manages authentication headers, request formatting, and error handling.
 *
 * @module services/api
 * @author Aura Team
 * @created 2024-01-01
 */

import env from '../config/env';

const API_BASE = env.apiBaseUrl;

/**
 * Helper function to generate request headers with authentication token.
 * 
 * @async
 * @returns {Promise<Object>} The headers object containing Content-Type and Authorization.
 */
async function getHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export const api = {
    /**
     * Start a new analysis job from text input.
     * 
     * @param {string} text - The user's input text describing their preferences.
     * @returns {Promise<Object>} The created job object (contains job_id).
     * @throws {Error} If the request fails.
     */
    analyzeText: async (text) => {
        const res = await fetch(`${API_BASE}/inputs/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error('Failed to start analysis');
        return res.json();
    },

    /**
     * Poll the status of a processing job.
     * 
     * @param {string} jobId - The UUID of the job to check.
     * @returns {Promise<Object>} The job status object.
     * @throws {Error} If the request fails.
     */
    getJobStatus: async (jobId) => {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch job status');
        return res.json();
    },

    /**
     * Retrieve the final results of a completed job.
     * 
     * @param {string} jobId - The UUID of the job.
     * @returns {Promise<Object>} The results object (summary, recommendations, etc.).
     * @throws {Error} If the request fails.
     */
    getResults: async (jobId) => {
        const res = await fetch(`${API_BASE}/results/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch results');
        return res.json();
    },

    /**
     * Send a message to the chat assistant.
     * 
     * @param {Array<Object>} history - Array of message objects ({role: string, content: string}).
     * @param {string|null} [conversationId=null] - The ID of the current conversation, if any.
     * @returns {Promise<Object>} The response containing the assistant's reply.
     * @throws {Error} If the request fails.
     */
    chat: async (history, conversationId = null) => {
        const body = { messages: history };
        if (conversationId) body.conversation_id = conversationId;

        let response;
        try {
            response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify(body)
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`Chat network error: ${message}`);
        }

        const contentType = response.headers.get("content-type") || "";
        let data;
        if (contentType.includes("application/json")) {
            try {
                data = await response.json();
            } catch {
                data = null;
            }
        } else {
            try {
                data = await response.text();
            } catch {
                data = "";
            }
        }

        if (!response.ok) {
            const detail =
                typeof data === "string"
                    ? data
                    : (data && (data.detail || data.message)) || "";
            const suffix = detail ? `: ${detail}` : "";
            throw new Error(`Chat failed (${response.status})${suffix}`);
        }

        return data;
    },

    /**
     * Fetch the user's conversation history.
     * 
     * @returns {Promise<Array<Object>>} List of conversation objects.
     * @throws {Error} If the request fails.
     */
    getHistory: async () => {
        const response = await fetch(`${API_BASE}/chat/history`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        return response.json();
    },

    /**
     * Fetch messages for a specific conversation.
     * 
     * @param {string} id - The conversation ID.
     * @returns {Promise<Array<Object>>} List of message objects.
     * @throws {Error} If the request fails.
     */
    getConversation: async (id) => {
        const response = await fetch(`${API_BASE}/chat/history/${id}`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch conversation');
        return response.json();
    },

    /**
     * Authenticate a user.
     * 
     * @param {string} email - User's email.
     * @param {string} password - User's password.
     * @returns {Promise<Object>} The authentication response containing the token.
     * @throws {Error} If login fails.
     */
    login: async (email, password) => {
        const formData = new FormData();
        formData.append('username', email); // OAuth2 expects 'username'
        formData.append('password', password);

        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: formData, // No Content-Type header needed for FormData, browser sets it
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    /**
     * Register a new user.
     * 
     * @param {string} email - User's email.
     * @param {string} password - User's password.
     * @returns {Promise<Object>} The created user object.
     * @throws {Error} If registration fails or validation errors occur.
     */
    register: async (email, password) => {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            data = { detail: await response.text() };
        }

        if (!response.ok) {
            let errorMessage = 'Registration failed';
            if (data.detail) {
                if (typeof data.detail === 'string') {
                    errorMessage = data.detail;
                } else if (Array.isArray(data.detail)) {
                    // Handle Pydantic validation errors array
                    errorMessage = data.detail.map(e => e.msg).join(', ');
                } else if (typeof data.detail === 'object') {
                    errorMessage = JSON.stringify(data.detail);
                }
            }
            throw new Error(errorMessage);
        }
        return data;
    },

    /**
     * Authenticate using Google OAuth token.
     * 
     * @param {string} credential - The Google ID token.
     * @returns {Promise<Object>} The authentication response containing the token.
     * @throws {Error} If authentication fails.
     */
    googleAuth: async (credential) => {
        const response = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Google authentication failed');
        }
        return response.json();
    },

    /**
     * Get the current user's profile.
     * 
     * @returns {Promise<Object>} The user profile object.
     * @throws {Error} If the request fails.
     */
    getProfile: async () => {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    /**
     * Change the current user's password.
     * 
     * @param {Object} params - The password change parameters.
     * @param {string} params.old_password - The current password.
     * @param {string} params.new_password - The new password.
     * @returns {Promise<Object>} Success message.
     * @throws {Error} If the request fails.
     */
    changePassword: async ({ old_password, new_password }) => {
        const response = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify({ old_password, new_password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    },

    /**
     * Request a password reset email.
     * 
     * @param {string} email - The user's email.
     * @returns {Promise<Object>} Success message.
     * @throws {Error} If the request fails.
     */
    forgotPassword: async (email) => {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    },

    /**
     * Reset password using a token.
     * 
     * @param {Object} params - The reset parameters.
     * @param {string} params.token - The reset token.
     * @param {string} params.new_password - The new password.
     * @returns {Promise<Object>} Success message.
     * @throws {Error} If the request fails.
     */
    resetPassword: async ({ token, new_password }) => {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, new_password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    },

    /**
     * Clear all chat history for the user.
     * 
     * @returns {Promise<Object>} Success message.
     * @throws {Error} If the request fails.
     */
    clearHistory: async () => {
        const response = await fetch(`${API_BASE}/chat/history`, {
            method: 'DELETE',
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to clear history');
        return response.json();
    },

    /**
     * Delete a specific conversation.
     * 
     * @param {string} id - The conversation ID.
     * @returns {Promise<Object>} Success message.
     * @throws {Error} If the request fails.
     */
    deleteConversation: async (id) => {
        const response = await fetch(`${API_BASE}/chat/history/${id}`, {
            method: 'DELETE',
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete conversation');
        return response.json();
    },

    /**
     * Get user's preferred language.
     * 
     * @returns {Promise<Object>} Object containing language code.
     * @throws {Error} If the request fails.
     */
    getUserLanguage: async () => {
        const response = await fetch(`${API_BASE}/auth/language`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to get language preference');
        return response.json();
    },

    /**
     * Update user's preferred language.
     * 
     * @param {string} language - The new language code (e.g., 'en', 'zh').
     * @returns {Promise<Object>} Object containing updated language.
     * @throws {Error} If the request fails.
     */
    updateUserLanguage: async (language) => {
        const response = await fetch(`${API_BASE}/auth/language`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify({ language })
        });
        if (!response.ok) throw new Error('Failed to update language preference');
        return response.json();
    },

    // Admin methods
    admin: {
        /**
         * Get a list of all users (Admin only).
         * 
         * @param {number} [skip=0] - Pagination skip.
         * @param {number} [limit=50] - Pagination limit.
         * @returns {Promise<Array<Object>>} List of user objects.
         */
        getUsers: async (skip = 0, limit = 50) => {
            const response = await fetch(`${API_BASE}/admin/users?skip=${skip}&limit=${limit}`, {
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        },

        /**
         * Ban a user (Admin only).
         * 
         * @param {number} userId - The user ID.
         * @returns {Promise<Object>} Success message.
         */
        banUser: async (userId) => {
            const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
                method: 'POST',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to ban user');
            return response.json();
        },

        /**
         * Unban a user (Admin only).
         * 
         * @param {number} userId - The user ID.
         * @returns {Promise<Object>} Success message.
         */
        unbanUser: async (userId) => {
            const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
                method: 'DELETE',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to unban user');
            return response.json();
        },

        /**
         * Send a system message to a user (Admin only).
         * 
         * @param {number} userId - The user ID.
         * @param {string} content - The message content.
         * @returns {Promise<Object>} Success message.
         */
        sendMessage: async (userId, content) => {
            const response = await fetch(`${API_BASE}/admin/users/${userId}/messages`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify({ content })
            });
            if (!response.ok) throw new Error('Failed to send message');
            return response.json();
        },

        /**
         * Get all announcements (Admin only).
         * 
         * @returns {Promise<Array<Object>>} List of announcements.
         */
        getAnnouncements: async () => {
            const response = await fetch(`${API_BASE}/admin/announcements`, {
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch announcements');
            return response.json();
        },

        /**
         * Create a new announcement (Admin only).
         * 
         * @param {string} title - Announcement title.
         * @param {string} content - Announcement content.
         * @returns {Promise<Object>} Success message.
         */
        createAnnouncement: async (title, content) => {
            const response = await fetch(`${API_BASE}/admin/announcements`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify({ title, content })
            });
            if (!response.ok) throw new Error('Failed to create announcement');
            return response.json();
        },

        /**
         * Delete an announcement (Admin only).
         * 
         * @param {number} id - Announcement ID.
         * @returns {Promise<Object>} Success message.
         */
        deleteAnnouncement: async (id) => {
            const response = await fetch(`${API_BASE}/admin/announcements/${id}`, {
                method: 'DELETE',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete announcement');
            return response.json();
        },

        /**
         * Toggle announcement visibility (Admin only).
         * 
         * @param {number} id - Announcement ID.
         * @returns {Promise<Object>} Success message.
         */
        toggleAnnouncement: async (id) => {
            const response = await fetch(`${API_BASE}/admin/announcements/${id}/toggle`, {
                method: 'PUT',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to toggle announcement');
            return response.json();
        },

        /**
         * Pin or unpin an announcement (Admin only).
         * 
         * @param {number} id - Announcement ID.
         * @returns {Promise<Object>} Success message.
         */
        pinAnnouncement: async (id) => {
            const response = await fetch(`${API_BASE}/admin/announcements/${id}/pin`, {
                method: 'PUT',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to pin announcement');
            return response.json();
        }
    },

    // Public announcements
    /**
     * Get active announcements for users.
     * 
     * @returns {Promise<Array<Object>>} List of active announcements.
     */
    getActiveAnnouncements: async () => {
        const response = await fetch(`${API_BASE}/announcements`);
        if (!response.ok) throw new Error('Failed to fetch announcements');
        return response.json();
    },

    // User messages
    /**
     * Get messages for the current user.
     * 
     * @returns {Promise<Array<Object>>} List of messages.
     */
    getMessages: async () => {
        const response = await fetch(`${API_BASE}/messages`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    /**
     * Mark a user message as read.
     * 
     * @param {number} messageId - Message ID.
     * @returns {Promise<Object>} Success message.
     */
    markMessageRead: async (messageId) => {
        const response = await fetch(`${API_BASE}/messages/${messageId}/read`, {
            method: 'PUT',
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to mark message as read');
        return response.json();
    }
};
