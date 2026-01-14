/**
 * Main Layout Component
 * 
 * Wraps authenticated pages with a Sidebar and consistent structure.
 * 
 * Last Modified: 2026-01-14
 */
import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-background pl-64">
            <Sidebar />
            <main className="min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
