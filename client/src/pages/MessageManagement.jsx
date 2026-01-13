import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Search, Plus, X, Globe, Save, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageManagement = () => {
    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMsg, setEditingMsg] = useState(null);
    const [formData, setFormData] = useState({
        MSG_ID: '', MSG_KEY: '', CATEGORY: 'COMMON', MSG_TYPE: 'LBL',
        TEXT_KO: '', TEXT_EN: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || '';

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${API_URL}/api/messages`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDeploy = async () => {
        if (!confirm('Deploy latest messages to JSON files?')) return;
        try {
            const res = await fetch(`${API_URL}/api/messages/export`, { method: 'POST' });
            if (res.ok) {
                alert('Deployment successful! Refresh the page to see changes.');
                fetchMessages();
            } else {
                alert('Deployment failed');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleOpenEdit = (msg) => {
        setEditingMsg(msg);
        setFormData({
            MSG_ID: msg.msg_id,
            MSG_KEY: msg.msg_key,
            CATEGORY: msg.category,
            MSG_TYPE: msg.msg_type,
            TEXT_KO: msg.text_ko || '',
            TEXT_EN: msg.text_en || ''
        });
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingMsg(null);
        setFormData({
            MSG_ID: '', MSG_KEY: '', CATEGORY: 'COMMON', MSG_TYPE: 'LBL',
            TEXT_KO: '', TEXT_EN: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingMsg
                ? `${API_URL}/api/messages/${editingMsg.msg_id}`
                : `${API_URL}/api/messages`;
            const method = editingMsg ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, REG_ID: currentUser?.username })
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchMessages();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filtered = messages.filter(m =>
        m.msg_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.text_ko && m.text_ko.includes(searchTerm))
    );

    return (
        <div className="p-8 max-w-7xl mx-auto text-zinc-100">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Globe className="w-8 h-8 text-primary" />
                        Message Management
                    </h1>
                    <p className="text-zinc-400 mt-1">Manage multi-language labels and messages</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleDeploy} className="bg-green-600 hover:bg-green-700 gap-2">
                        <UploadCloud className="w-4 h-4" />
                        Deploy to App
                    </Button>
                    <Button onClick={handleOpenCreate} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Message
                    </Button>
                </div>
            </header>

            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-zinc-500 w-4 h-4" />
                <Input
                    placeholder="Search Key or Korean text..."
                    className="pl-9 bg-surface border-zinc-800"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="overflow-hidden border-zinc-800 bg-surface">
                <table className="w-full text-sm">
                    <thead className="bg-black/20 border-b border-zinc-800">
                        <tr>
                            <th className="text-left py-4 px-6 font-semibold text-zinc-500">Category / Key</th>
                            <th className="text-left py-4 px-6 font-semibold text-zinc-500">Korean</th>
                            <th className="text-left py-4 px-6 font-semibold text-zinc-500">English</th>
                            <th className="text-left py-4 px-6 font-semibold text-zinc-500">Sync Status</th>
                            <th className="text-right py-4 px-6 font-semibold text-zinc-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filtered.map(msg => (
                            <tr key={msg.msg_id} className="hover:bg-zinc-800/30">
                                <td className="py-4 px-6">
                                    <span className="text-xs text-zinc-500 block">{msg.category}</span>
                                    <span className="font-mono text-primary">{msg.msg_key}</span>
                                </td>
                                <td className="py-4 px-6">{msg.text_ko}</td>
                                <td className="py-4 px-6">{msg.text_en}</td>
                                <td className="py-4 px-6">
                                    {msg.sync_stat === 'CHANGED' ?
                                        <span className="text-orange-400 text-xs">Changed</span> :
                                        <span className="text-green-500 text-xs">Synced</span>
                                    }
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(msg)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface rounded-2xl w-full max-w-lg border border-zinc-800 p-6"
                        >
                            <h3 className="text-lg font-bold mb-6">
                                {editingMsg ? 'Edit Message' : 'New Message'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-zinc-500">Category</label>
                                        <Input
                                            value={formData.CATEGORY}
                                            onChange={e => setFormData({ ...formData, CATEGORY: e.target.value })}
                                            className="bg-black/20 kv-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500">Key</label>
                                        <Input
                                            value={formData.MSG_KEY}
                                            onChange={e => setFormData({ ...formData, MSG_KEY: e.target.value })}
                                            disabled={!!editingMsg}
                                            className="bg-black/20 font-mono"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">Korean (KO)</label>
                                    <Input
                                        value={formData.TEXT_KO}
                                        onChange={e => setFormData({ ...formData, TEXT_KO: e.target.value })}
                                        className="bg-black/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500">English (EN)</label>
                                    <Input
                                        value={formData.TEXT_EN}
                                        onChange={e => setFormData({ ...formData, TEXT_EN: e.target.value })}
                                        className="bg-black/20"
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                                    <Button type="submit" className="flex-1">Save</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MessageManagement;
