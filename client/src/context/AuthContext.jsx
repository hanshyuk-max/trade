/**
 * Authentication Context
 * 
 * Manages global authentication state (user, token) and provides login/register methods.
 * 
 * Last Modified: 2026-01-14
 */
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

    /**
     * Authenticate user with username and password.
     * Handles both standard login and concurrent session checks.
     */
    const login = async (username, password) => {
        try {
            // Determine API URL:
            // - Production: Use relative path (Empty string) so Vercel's 'rewrites' in vercel.json handle the routing.
            // - This prevents CORS issues and ensures requests go to the same domain.
            const API_URL = '';

            // DEBUG: Alert user to confirm JS is executing and Fetch is starting
            alert(`[v1.2] Attempting connect to: ${window.location.origin}/api/auth/login`);

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            // DEBUG: Alert response status to check if 404 (Not Found) or 500 (Server Error) occurs
            alert(`[v1.2] Server Response Code: ${response.status}`);

            // Parse response safely
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Login Parse Error:", text);
                // DEBUG: Alert the actual text to see if it's HTML
                alert(`Login Failed: Server returned non-JSON response.\n\nResponse Preview:\n${text.substring(0, 200)}`);
                throw new Error("Invalid server response.");
            }

            if (!response.ok) {
                throw new Error(data.error || `Login failed (${response.status})`);
            }

            // Handle Concurrent Login (if server returns this status)
            if (data.status === 'CONCURRENT_LOGIN') {
                return {
                    success: false,
                    status: 'CONCURRENT_LOGIN',
                    sessions: data.sessions
                };
            }

            // Success: Set user state and persist token
            setUser(data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            return { success: true };

        } catch (err) {
            console.error("Login Error:", err);
            // Display friendly error message
            const API_URL = import.meta.env.VITE_API_URL || '(Local Proxy)';
            alert(`Login Attempt Failed.\nError: ${err.message}\nCheck console for details.`);
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
