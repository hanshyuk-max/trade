/**
 * Login Page
 * 
 * Handles user login interactions with concurrent session management modal.
 * 
 * Last Modified: 2026-01-14
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, User } from 'lucide-react';
import RegisterModal from '../components/auth/RegisterModal';
import ConcurrentLoginModal from '../components/auth/ConcurrentLoginModal';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t, i18n } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    // Concurrent Login State
    const [showConcurrentModal, setShowConcurrentModal] = useState(false);
    const [activeSessions, setActiveSessions] = useState([]);

    const { login, register, resolveConcurrentLogin } = useAuth();
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert("Handler Called"); // DEBUG
        console.log("Login submitted", { username });
        setError(null);

        const result = await login(username, password);
        if (result.success) {
            navigate('/dashboard');
        } else if (result.status === 'CONCURRENT_LOGIN') {
            setActiveSessions(result.sessions);
            setShowConcurrentModal(true);
        } else {
            setError(result.error || 'Invalid credentials. Try admin / 1234');
        }
    };

    const handleConcurrentAction = async (action) => {
        const result = await resolveConcurrentLogin(username, password, action);
        setShowConcurrentModal(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Login failed during session resolution');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => changeLanguage('ko')} className={`px-3 py-1 rounded text-sm ${i18n.language === 'ko' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'}`}>KO</button>
                <button onClick={() => changeLanguage('en')} className={`px-3 py-1 rounded text-sm ${i18n.language === 'en' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white'}`}>EN</button>
            </div>

            <ConcurrentLoginModal
                isOpen={showConcurrentModal}
                sessions={activeSessions}
                onConfirm={handleConcurrentAction}
                onClose={() => setShowConcurrentModal(false)}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-surface rounded-3xl shadow-2xl shadow-black/50 overflow-hidden p-8 md:p-12 text-center border border-zinc-800"
            >
                <div className="mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                        <span className="text-white text-2xl font-bold">A</span>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Welcome Back</h1>
                    <p className="text-zinc-400 mt-2 text-lg">Sign in to manage your portfolio</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-zinc-500 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-12 bg-background border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:ring-primary/20"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-zinc-500 w-5 h-5" />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-12 bg-background border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 text-lg rounded-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                        onClick={(e) => console.log('Button clicked')}
                    >
                        Sign In (Standard)
                    </button>
                </form>

                <div className="mt-8 text-sm text-zinc-600 space-y-4">
                    <p>Protected by Antigravity Intelligence</p>

                    <div className="pt-4 border-t border-zinc-800">
                        <p className="text-zinc-500 mb-3">Don't have an account?</p>
                        <button
                            onClick={() => setIsRegisterOpen(true)}
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Create an Account
                        </button>
                    </div>
                </div>
            </motion.div>

            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
        </div>
    );
};

export default Login;
