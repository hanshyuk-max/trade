/**
 * Dashboard Page
 * 
 * Displays the main user dashboard with portfolio summary.
 * 
 * Last Modified: 2026-01-14
 */
import React from 'react';
import { Card } from '../components/ui/Card';

const Dashboard = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Overview of your portfolio performance</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card hover className="p-6">
                    <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Capital</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-zinc-100">$124,500.00</span>
                        <span className="text-sm font-medium text-green-500">+2.5%</span>
                    </div>
                </Card>
                <Card hover className="p-6">
                    <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Invested</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-zinc-100">$85,240.00</span>
                    </div>
                </Card>
                <Card hover className="p-6">
                    <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Cash Balance</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-zinc-100">$39,260.00</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96">
                    <h3 className="text-lg font-semibold mb-4 text-zinc-100">Portfolio composition</h3>
                    <div className="h-full flex items-center justify-center text-zinc-600">
                        Chart Placeholder
                    </div>
                </Card>
                <Card className="h-96">
                    <h3 className="text-lg font-semibold mb-4 text-zinc-100">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">NVDA</div>
                                    <div>
                                        <p className="font-medium text-zinc-200">Buy NVDA</p>
                                        <p className="text-sm text-zinc-500">2 shares @ $135.00</p>
                                    </div>
                                </div>
                                <span className="font-medium text-zinc-100">-$270.00</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
