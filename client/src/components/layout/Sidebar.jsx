import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, History, Wallet, Users, LogOut, Settings, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const { logout } = useAuth();
    const { t } = useTranslation();

    // Using a more structured array for nav items for better maintainability (similar to recent best practices)
    const navItems = [
        { name: t('MENU_DASHBOARD'), to: '/dashboard', icon: Home },
        { name: t('MENU_TRADE'), to: '/trade', icon: TrendingUp },
        { name: t('MENU_HISTORY'), to: '/history', icon: History },
        { name: t('MENU_CAPITAL'), to: '/capital', icon: Wallet },
        { name: t('MENU_USERS'), to: '/users', icon: Users },
        { name: t('MENU_SYSCONFIG'), to: '/system/config', icon: Settings },
        { name: t('MENU_MESSAGES'), to: '/system/messages', icon: Globe },
    ];

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
                <div className="text-xs font-medium text-zinc-500 uppercase px-4 mb-2 tracking-wider">{t('MENU_TITLE')}</div>
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

            <div className="p-4 border-t border-zinc-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    {t('MENU_SIGNOUT')}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
