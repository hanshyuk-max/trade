import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(username, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Invalid credentials. Try admin / 1234');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 text-center"
            >
                <div className="mb-8">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/20">
                        <span className="text-white text-2xl font-bold">A</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 mt-2 text-lg">Sign in to manage your portfolio</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-12"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-12"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <Button type="submit" className="w-full py-4 text-lg rounded-xl shadow-xl shadow-blue-500/20">
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 text-sm text-gray-400">
                    Protected by Antigravity Intelligence
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
