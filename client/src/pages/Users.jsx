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

    // Fetch users (mock connection to real API)
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users');
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
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, { method: 'DELETE' });
            if (response.ok) {
                setUsers(users.filter(u => u.user_id !== userId));
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleEditClick = (user) => {
        // Permission check: Admin can edit anyone, User can only edit self
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
            const response = await fetch(`http://localhost:3000/api/users/${editingUser.user_id}`, {
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

    // Filter logic
    const filteredUsers = users.filter(user =>
        (currentUser.role === 'ADMIN' || user.user_id === currentUser.id) && // If not admin, show only self? Or show all but read-only? Requirement said "Admin: full view, User: self edit". Usually users can't see other users list.
        (user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filter check based on requirment: "If user is not admin, correct to edit only own info".
    // Requirement also said: "If user is admin, view all...". 
    // It's ambiguous if non-admin can VIEW all. Usually no. I will restrict VIEW to self if not admin.
    const displayUsers = currentUser.role === 'ADMIN'
        ? filteredUsers
        : users.filter(u => u.user_id === currentUser.id);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage system access and permissions</p>
                </div>
                {currentUser.role === 'ADMIN' && (
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </header>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
                            ) : displayUsers.map((user) => (
                                <tr key={user.user_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                                {user.profile_image_url ? (
                                                    <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    user.user_name?.[0]
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.user_name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.user_role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.user_role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {currentUser.role === 'ADMIN' && (
                                            <button
                                                onClick={() => handleDelete(user.user_id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <Input
                                        value={editingUser?.user_name || ''}
                                        onChange={e => setEditingUser({ ...editingUser, user_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <Input
                                        value={editingUser?.email || ''}
                                        onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                                    <Input
                                        value={editingUser?.nickname || ''}
                                        onChange={e => setEditingUser({ ...editingUser, nickname: e.target.value })}
                                    />
                                </div>

                                {currentUser.role === 'ADMIN' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200"
                                                value={editingUser?.user_role || 'USER'}
                                                onChange={e => setEditingUser({ ...editingUser, user_role: e.target.value })}
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200"
                                                value={editingUser?.status || 'ACTIVE'}
                                                onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="SUSPENDED">Suspended</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
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
