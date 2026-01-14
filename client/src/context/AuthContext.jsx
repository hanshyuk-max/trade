import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Use relative path - Vite proxy will handle the redirect
            // If VITE_API_URL is set (e.g. prod), use it; otherwise empty string for relative
            const API_URL = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Login JSON Parse Error:", text);
                alert(`[v2] Login Error: Status ${response.status} ${response.statusText}\nRaw Response: "${text}"`);
                throw new Error("Server returned invalid response. Check popup.");
            }

            if (!response.ok) {
                const errorMsg = data.error || 'Login failed';
                console.error(`Login Failed: ${response.status} ${response.statusText}`, data);
                throw new Error(`${errorMsg} (Status: ${response.status})`);
            }

            // Handle Concurrent Login
            if (data.status === 'CONCURRENT_LOGIN') {
                return {
                    success: false,
                    status: 'CONCURRENT_LOGIN',
                    sessions: data.sessions
                };
            }

            setUser(data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            return { success: true };

        } catch (err) {
            console.error("Login Critical Error:", err);
            // Show more details in the alert
            const API_URL = import.meta.env.VITE_API_URL || '(relative)';
            alert(`Login Error: ${err.message}\nRequest URL: ${API_URL}/api/auth/login\nPlease check console for details.`);
            return { success: false, error: err.message };
        }
    };

    const resolveConcurrentLogin = async (username, password, action) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API_URL}/api/auth/login/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, action })
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Concurrent Login JSON Parse Error:", text);
                throw new Error("Server returned invalid response.");
            }

            if (!response.ok) throw new Error(data.error || 'Login failed');

            setUser(data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const register = async (userData) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Register JSON Parse Error:", text);
                throw new Error("Server returned invalid response.");
            }

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return { success: true, message: data.message };

        } catch (err) {
            console.error("Registration Error:", err);
            return { success: false, error: err.message };
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || '';
            if (token) {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
            }
        } catch (e) {
            console.error("Logout error", e);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, resolveConcurrentLogin, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
