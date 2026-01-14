/**
 * Concurrent Login Modal
 * 
 * Dialog presented when a user is already logged in elsewhere, offering options to force login.
 * 
 * Last Modified: 2026-01-14
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Smartphone, Monitor, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConcurrentLoginModal = ({ isOpen, onClose, onConfirm, sessions }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">동시 접속 알림</h3>
                                <p className="text-zinc-400 text-sm">다른 기기에서 접속 중입니다.</p>
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 space-y-3">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">현재 접속중인 기기</h4>
                            {sessions.map((session, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm text-zinc-300">
                                    {session.device.toLowerCase().includes('mobile') ? (
                                        <Smartphone className="w-4 h-4 text-zinc-500" />
                                    ) : (
                                        <Monitor className="w-4 h-4 text-zinc-500" />
                                    )}
                                    <span className="truncate flex-1">{session.device}</span>
                                    <span className="text-zinc-600 text-xs">
                                        {new Date(session.last_accessed).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className="text-zinc-400 text-sm mb-6">
                            계속 접속하시겠습니까?<br />
                            <span className="text-zinc-500 text-xs">"허용" 시 두 기기 모두 사용 가능합니다. "차단" 시 기존 기기는 로그아웃됩니다.</span>
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onConfirm('DENY_ALL')}
                                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                기존 기기 차단
                            </button>
                            <button
                                onClick={() => onConfirm('ALLOW')}
                                className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                동시 접속 허용
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConcurrentLoginModal;
