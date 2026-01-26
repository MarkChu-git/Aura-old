import env from '../config/env';

const API_BASE = env.apiBaseUrl;

// Helper to add auth header
async function getHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export const api = {
    // Create a new job from text input
    analyzeText: async (text) => {
        const res = await fetch(`${API_BASE}/inputs/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error('Failed to start analysis');
        return res.json();
    },

    // Poll job status
    getJobStatus: async (jobId) => {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch job status');
        return res.json();
    },

    // Get final results
    getResults: async (jobId) => {
        const res = await fetch(`${API_BASE}/results/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch results');
        return res.json();
    },

    // Chat
    // Chat
    chat: async (history, conversationId = null) => {
        const body = { messages: history };
        if (conversationId) body.conversation_id = conversationId;

        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Chat failed');
        return response.json();
    },

    getHistory: async () => {
        const response = await fetch(`${API_BASE}/chat/history`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        return response.json();
    },

    getConversation: async (id) => {
        const response = await fetch(`${API_BASE}/chat/history/${id}`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch conversation');
        return response.json();
    },

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

    getProfile: async () => {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

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

    clearHistory: async () => {
        const response = await fetch(`${API_BASE}/chat/history`, {
            method: 'DELETE',
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to clear history');
        return response.json();
    },

    deleteConversation: async (id) => {
        const response = await fetch(`${API_BASE}/chat/history/${id}`, {
            method: 'DELETE',
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete conversation');
        return response.json();
    },

    getUserLanguage: async () => {
        const response = await fetch(`${API_BASE}/auth/language`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to get language preference');
        return response.json();
    },

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
        getUsers: async (skip = 0, limit = 50) => {
            const response = await fetch(`${API_BASE}/admin/users?skip=${skip}&limit=${limit}`, {
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        },
        banUser: async (userId) => {
            const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
                method: 'POST',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to ban user');
            return response.json();
        },
        unbanUser: async (userId) => {
            const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
                method: 'DELETE',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to unban user');
            return response.json();
        },
        sendMessage: async (userId, content) => {
            const response = await fetch(`${API_BASE}/admin/users/${userId}/messages`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify({ content })
            });
            if (!response.ok) throw new Error('Failed to send message');
            return response.json();
        },
        getAnnouncements: async () => {
            const response = await fetch(`${API_BASE}/admin/announcements`, {
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch announcements');
            return response.json();
        },
        createAnnouncement: async (title, content) => {
            const response = await fetch(`${API_BASE}/admin/announcements`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify({ title, content })
            });
            if (!response.ok) throw new Error('Failed to create announcement');
            return response.json();
        },
        deleteAnnouncement: async (id) => {
            const response = await fetch(`${API_BASE}/admin/announcements/${id}`, {
                method: 'DELETE',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete announcement');
            return response.json();
        },
        toggleAnnouncement: async (id) => {
            const response = await fetch(`${API_BASE}/admin/announcements/${id}/toggle`, {
                method: 'PUT',
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to toggle announcement');
            return response.json();
        }
    },

    // Public announcements
    getActiveAnnouncements: async () => {
        const response = await fetch(`${API_BASE}/announcements`);
        if (!response.ok) throw new Error('Failed to fetch announcements');
        return response.json();
    },

    // User messages
    getMessages: async () => {
        const response = await fetch(`${API_BASE}/messages`, {
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    markMessageRead: async (messageId) => {
        const response = await fetch(`${API_BASE}/messages/${messageId}/read`, {
            method: 'PUT',
            headers: await getHeaders()
        });
        if (!response.ok) throw new Error('Failed to mark message as read');
        return response.json();
    }
};
