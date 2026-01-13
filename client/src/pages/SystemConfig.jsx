import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Search, Plus, X, Settings, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemConfig = () => {
    const { user: currentUser } = useAuth();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [formData, setFormData] = useState({
        CONFIG_ID: '', SYS_CODE: 'PORTAL', ENV_TYPE: 'DEV', CONFIG_GROUP: '',
        CONFIG_KEY: '', CONFIG_VALUE: '', VALUE_TYPE: 'STRING',
        CONFIG_NM_KO: '', REMARK_KO: '', USE_YN: 'Y'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Fetch Configs
    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('name', searchTerm); // Search by name or key? 
            // Simplified search on client side for multiple fields or backend supports individual params.
            // My backend supports group, key, name. Let's rely on backend or client filter.
            // I'll fetch all and filter client side for better UX on small datasets, 
            // or pass params if dataset is large. Let's fetch all for now for responsiveness.

            const response = await fetch(`${API_URL}/api/config`);
            if (response.ok) {
                const data = await response.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error("Failed to fetch configs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    // Form Handlers
    const handleOpenCreate = () => {
        setEditingConfig(null);
        setFormData({
            CONFIG_ID: `CFG_${Date.now()}`, // Auto-gen ID example
            SYS_CODE: 'PORTAL', ENV_TYPE: 'DEV', CONFIG_GROUP: '',
            CONFIG_KEY: '', CONFIG_VALUE: '', VALUE_TYPE: 'STRING',
            CONFIG_NM_KO: '', REMARK_KO: '', USE_YN: 'Y',
            SORT_ORDR: 0
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (config) => {
        setEditingConfig(config);
        // Map lowercase DB keys to Uppercase State keys if needed, OR just use lowercase everywhere.
        // Let's map to Uppercase for formData consistency with Create.
        setFormData({
            CONFIG_ID: config.config_id,
            SYS_CODE: config.sys_code,
            ENV_TYPE: config.env_type,
            CONFIG_GROUP: config.config_group,
            CONFIG_KEY: config.config_key,
            CONFIG_VALUE: config.config_value,
            VALUE_TYPE: config.value_type,
            CONFIG_NM_KO: config.config_nm_ko,
            REMARK_KO: config.remark_ko,
            USE_YN: config.use_yn,
            SORT_ORDR: config.sort_ordr
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this configuration?')) return;

        try {
            const response = await fetch(`${API_URL}/api/config/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ MOD_ID: currentUser?.username || 'ADMIN', CHG_REASON: 'Manual Delete' })
            });

            if (response.ok) {
                fetchConfigs();
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingConfig
                ? `${API_URL}/api/config/${formData.CONFIG_ID}` // Use formData ID
                : `${API_URL}/api/config`;

            const method = editingConfig ? 'PUT' : 'POST';

            // Standardize Keys to match DB columns (Already matching in state)
            const payload = {
                ...formData,
                REG_ID: currentUser?.username || 'ADMIN',
                MOD_ID: currentUser?.username || 'ADMIN',
                CHG_REASON: editingConfig ? 'Manual Update' : undefined
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchConfigs();
            } else {
                const err = await response.json();
                alert(`Error: ${err.error || 'Operation failed'}`);
            }
        } catch (error) {
            console.error('Submit failed', error);
        }
    };

    const filteredConfigs = configs.filter(item => {
        const term = searchTerm.toLowerCase();
        // Use optional chaining for safety
        const nameKo = item.config_nm_ko || '';
        const key = item.config_key || '';
        const group = item.config_group || '';

        const matchesSearch =
            nameKo.toLowerCase().includes(term) ||
            key.toLowerCase().includes(term) ||
            group.toLowerCase().includes(term);

        return matchesSearch;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto text-zinc-100">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        System Configuration
                    </h1>
                    <p className="text-zinc-400 mt-1">Manage global system settings and environment variables</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={fetchConfigs} variant="ghost" className="text-zinc-400 hover:text-white">
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button onClick={handleOpenCreate} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Config
                    </Button>
                </div>
            </header>

            <div className="mb-6 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 text-zinc-500 w-4 h-4" />
                    <Input
                        placeholder="Search by Group, Key, or Name..."
                        className="pl-9 bg-surface border-zinc-800 text-zinc-100 focus:border-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="overflow-hidden border-zinc-800 bg-surface">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-black/20 border-b border-zinc-800">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold text-zinc-500">Group / Key</th>
                                <th className="text-left py-4 px-6 font-semibold text-zinc-500">Name / Value</th>
                                <th className="text-left py-4 px-6 font-semibold text-zinc-500">Context</th>
                                <th className="text-left py-4 px-6 font-semibold text-zinc-500">Status</th>
                                <th className="text-right py-4 px-6 font-semibold text-zinc-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-zinc-500">Loading...</td></tr>
                            ) : filteredConfigs.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-zinc-500">No configuration found.</td></tr>
                            ) : filteredConfigs.map((item) => (
                                <tr key={item.config_id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="py-4 px-6 align-top">
                                        <div className="font-medium text-primary">{item.config_group}</div>
                                        <div className="text-zinc-100 font-mono mt-1 text-xs">{item.config_key}</div>
                                    </td>
                                    <td className="py-4 px-6 align-top max-w-xs truncate">
                                        <div className="text-zinc-200">{item.config_nm_ko}</div>
                                        <div className="text-zinc-500 truncate mt-1 text-xs" title={item.config_value}>{item.config_value}</div>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-400">{item.sys_code}</span>
                                            <span className="px-2 py-0.5 rounded bg-blue-900/30 border border-blue-800 text-xs text-blue-400">{item.env_type}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 align-top">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.use_yn === 'Y' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {item.use_yn === 'Y' ? 'Active' : 'Diffused'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)} className="h-8 w-8 p-0 text-zinc-400 hover:text-blue-400">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.config_id)} className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-800 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-primary" />
                                    {editingConfig ? 'Edit Configuration' : 'New Configuration'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* System Context */}
                                    <div className="col-span-2 grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">Config ID</label>
                                            <Input
                                                value={formData.CONFIG_ID}
                                                onChange={e => setFormData({ ...formData, CONFIG_ID: e.target.value })}
                                                disabled={!!editingConfig}
                                                className="bg-black/20 border-zinc-800 text-zinc-400 font-mono text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">System Code</label>
                                            <Input
                                                value={formData.SYS_CODE}
                                                onChange={e => setFormData({ ...formData, SYS_CODE: e.target.value })}
                                                className="bg-black/20 border-zinc-800 text-zinc-100 focus:border-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">Env Type</label>
                                            <select
                                                value={formData.ENV_TYPE}
                                                onChange={e => setFormData({ ...formData, ENV_TYPE: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="DEV" className="bg-zinc-800">DEV</option>
                                                <option value="STG" className="bg-zinc-800">STG</option>
                                                <option value="PRD" className="bg-zinc-800">PRD</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Key Info */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Config Group *</label>
                                        <Input
                                            required
                                            value={formData.CONFIG_GROUP}
                                            onChange={e => setFormData({ ...formData, CONFIG_GROUP: e.target.value })}
                                            className="bg-black/20 border-zinc-800 text-zinc-100 focus:border-primary/50"
                                            placeholder="e.g. AUTH, NETWORK"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Config Key *</label>
                                        <Input
                                            required
                                            value={formData.CONFIG_KEY}
                                            onChange={e => setFormData({ ...formData, CONFIG_KEY: e.target.value })}
                                            disabled={!!editingConfig} // Keys usually immutable or hard to change due to index
                                            className={`bg-black/20 border-zinc-800 text-zinc-100 focus:border-primary/50 ${editingConfig ? 'opacity-50' : ''}`}
                                            placeholder="e.g. SESSION_TIMEOUT_MS"
                                        />
                                    </div>

                                    {/* Values */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Config Value *</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.CONFIG_VALUE}
                                            onChange={e => setFormData({ ...formData, CONFIG_VALUE: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm placeholder:text-zinc-600"
                                            placeholder="Value..."
                                        />
                                    </div>

                                    {/* Meta */}
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Name (KO) *</label>
                                        <Input
                                            required
                                            value={formData.CONFIG_NM_KO}
                                            onChange={e => setFormData({ ...formData, CONFIG_NM_KO: e.target.value })}
                                            className="bg-black/20 border-zinc-800 text-zinc-100 focus:border-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Value Type</label>
                                        <select
                                            value={formData.VALUE_TYPE}
                                            onChange={e => setFormData({ ...formData, VALUE_TYPE: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-black/20 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="STRING" className="bg-zinc-800">STRING</option>
                                            <option value="NUMBER" className="bg-zinc-800">NUMBER</option>
                                            <option value="JSON" className="bg-zinc-800">JSON</option>
                                            <option value="BOOL" className="bg-zinc-800">BOOL</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Remark (KO)</label>
                                        <Input
                                            value={formData.REMARK_KO}
                                            onChange={e => setFormData({ ...formData, REMARK_KO: e.target.value })}
                                            className="bg-black/20 border-zinc-800 text-zinc-100 focus:border-primary/50"
                                        />
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">Sort Order</label>
                                            <Input
                                                type="number"
                                                value={formData.SORT_ORDR}
                                                onChange={e => setFormData({ ...formData, SORT_ORDR: e.target.value })}
                                                className="bg-black/20 border-zinc-800 text-zinc-100 focus:border-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">Use Y/N</label>
                                            <select
                                                value={formData.USE_YN}
                                                onChange={e => setFormData({ ...formData, USE_YN: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="Y" className="bg-zinc-800">Yes</option>
                                                <option value="N" className="bg-zinc-800">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-zinc-800 mt-6">
                                    <Button type="button" variant="ghost" className="flex-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1">Save Configuration</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SystemConfig;
