import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-[#F5F5F7] pl-64">
            <Sidebar />
            <main className="min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
