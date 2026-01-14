/**
 * User Management Page (Admin)
 * 
 * Interface for viewing and managing registered users.
 * 
 * Last Modified: 2026-01-14
 */
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Fetch users
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`${API_URL}/api/users/${userId}`, { method: 'DELETE' });
            if (response.ok) {
                setUsers(users.filter(u => u.user_id !== userId));
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleEditClick = (user) => {
        if (currentUser.role !== 'ADMIN' && currentUser.id !== user.user_id) {
            alert("You can only edit your own profile.");
            return;
        }
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/users/${editingUser.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUsers(users.map(u => u.user_id === updatedUser.user_id ? updatedUser : u));
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    const filteredUsers = users.filter(user =>
        (currentUser.role === 'ADMIN' || user.user_id === currentUser.id) &&
        (user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const displayUsers = currentUser.role === 'ADMIN'
        ? filteredUsers
        : users.filter(u => u.user_id === currentUser.id);

    return (
        <div className="p-8 max-w-7xl mx-auto text-zinc-100">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">User Management</h1>
                    <p className="text-zinc-400 mt-1">Manage system access and permissions</p>
                </div>
                {currentUser.role === 'ADMIN' && (
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-zinc-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-9 pr-4 py-2 bg-surface border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </header>

            <Card className="overflow-hidden border-zinc-800 bg-surface">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20 border-b border-zinc-800">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last Login</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-zinc-500">Loading...</td></tr>
                            ) : displayUsers.map((user) => (
                                <tr key={user.user_id} className="hover:bg-active/5 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold overflow-hidden border border-zinc-700">
                                                {user.profile_image_url ? (
                                                    <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    user.user_name?.[0]
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-zinc-200">{user.user_name}</div>
                                                <div className="text-xs text-zinc-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.user_role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                            }`}>
                                            {user.user_role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            user.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-zinc-500">
                                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="p-1 text-zinc-400 hover:text-blue-400 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {currentUser.role === 'ADMIN' && (
                                            <button
                                                onClick={() => handleDelete(user.user_id)}
                                                className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-800"
                        >
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-zinc-100">Edit User</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                                    <Input
                                        value={editingUser?.user_name || ''}
                                        onChange={e => setEditingUser({ ...editingUser, user_name: e.target.value })}
                                        className="bg-black/20 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                                    <Input
                                        value={editingUser?.email || ''}
                                        onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                        className="bg-black/20 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Nickname</label>
                                    <Input
                                        value={editingUser?.nickname || ''}
                                        onChange={e => setEditingUser({ ...editingUser, nickname: e.target.value })}
                                        className="bg-black/20 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-primary/50"
                                    />
                                </div>

                                {currentUser.role === 'ADMIN' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={editingUser?.user_role || 'USER'}
                                                onChange={e => setEditingUser({ ...editingUser, user_role: e.target.value })}
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={editingUser?.status || 'ACTIVE'}
                                                onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="PENDING">Pending</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="SUSPENDED">Suspended</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </div>

                                        {/* Approval Fields (Only visible if status is PENDING or recently changed) */}
                                        {editingUser?.status === 'PENDING' && (
                                            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                                <p className="text-yellow-400 text-sm">
                                                    Change status to <strong>ACTIVE</strong> to approve this user.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="ghost" className="flex-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1">Save Changes</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Users;
