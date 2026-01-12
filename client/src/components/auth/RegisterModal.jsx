import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Mail, Phone, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

const RegisterModal = ({ isOpen, onClose }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        login_id: '',
        password: '',
        user_name: '',
        email: '',
        phone_number: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => {
                onClose();
                setSuccess('');
                setFormData({ login_id: '', password: '', user_name: '', email: '', phone_number: '' });
            }, 3000);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface border border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative"
                        >
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 text-zinc-500 hover:text-zinc-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-zinc-100">Create Account</h2>
                                <p className="text-zinc-400 mt-2">Join TradeOS platform</p>
                            </div>

                            {success ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-100 mb-2">Registration Successful</h3>
                                    <p className="text-zinc-400">{success}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 text-zinc-500 w-5 h-5" />
                                            <Input
                                                name="login_id"
                                                placeholder="Username"
                                                value={formData.login_id}
                                                onChange={handleChange}
                                                className="pl-12 bg-background border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 text-zinc-500 w-5 h-5" />
                                            <Input
                                                name="password"
                                                type="password"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="pl-12 bg-background border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 text-zinc-500 w-5 h-5" />
                                            <Input
                                                name="user_name"
                                                placeholder="Full Name"
                                                value={formData.user_name}
                                                onChange={handleChange}
                                                className="pl-12 bg-background border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 text-zinc-500 w-5 h-5" />
                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="pl-12 bg-background border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-3.5 text-zinc-500 w-5 h-5" />
                                            <Input
                                                name="phone_number"
                                                placeholder="Phone Number (Optional)"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                className="pl-12 bg-background border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full py-4 text-lg rounded-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                        Create Account
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RegisterModal;
