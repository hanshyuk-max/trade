import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, History, Wallet, Users, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils'; // Assuming you have this utility

const Sidebar = () => {
    const { logout } = useAuth();

    // Using a more structured array for nav items for better maintainability (similar to recent best practices)
    const navItems = [
        { name: 'Dashboard', to: '/dashboard', icon: Home },
        { name: 'Trade', to: '/trade', icon: TrendingUp },
        { name: 'History', to: '/history', icon: History },
        { name: 'Capital', to: '/capital', icon: Wallet },
        { name: 'Users', to: '/users', icon: Users },
    ];

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50">
            {/* Logo Area */}
            <div className="p-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    T
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">TradeOS</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-medium text-gray-400 uppercase px-4 mb-2 tracking-wider">Menu</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                            isActive
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <item.icon className="w-5 h-5 transition-colors" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
