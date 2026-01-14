/**
 * Sidebar Navigation Component
 * 
 * Renders the side navigation menu with links to different pages.
 * 
 * Last Modified: 2026-01-14
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, History, Wallet, Users, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils'; // Assuming you have this utility

const Sidebar = () => {
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', to: '/dashboard', icon: Home, roles: ['USER', 'ADMIN', 'MANAGER'] },
        { name: 'Trade', to: '/trade', icon: TrendingUp, roles: ['USER', 'ADMIN', 'MANAGER'] },
        { name: 'History', to: '/history', icon: History, roles: ['USER', 'ADMIN', 'MANAGER'] },
        { name: 'Capital', to: '/capital', icon: Wallet, roles: ['USER', 'ADMIN', 'MANAGER'] },
        { name: 'Users', to: '/users', icon: Users, roles: ['ADMIN'] },
        // { name: 'Messages', to: '/system/messages', icon: Globe, roles: ['ADMIN'] }, // Removed
    ];

    // Filter items based on user role (default to USER if no role)
    // const userRole = useAuth().user?.role || 'USER';
    // const activeNavItems = navItems.filter(item => item.roles.includes(userRole));

    return (
        <aside className="w-64 bg-surface/80 backdrop-blur-xl h-screen border-r border-zinc-800 flex flex-col fixed left-0 top-0 z-50">
            {/* Logo Area */}
            <div className="p-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    T
                </div>
                <span className="text-xl font-bold text-zinc-100 tracking-tight">TradeOS</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-medium text-zinc-500 uppercase px-4 mb-2 tracking-wider">Menu</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                            isActive
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                        )}
                    >
                        <item.icon className="w-5 h-5 transition-colors" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-zinc-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
