import React from 'react';
import { Card } from '../components/ui/Card';

const Dashboard = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of your portfolio performance</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card hover className="p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Capital</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">$124,500.00</span>
                        <span className="text-sm font-medium text-green-500">+2.5%</span>
                    </div>
                </Card>
                <Card hover className="p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Invested</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">$85,240.00</span>
                    </div>
                </Card>
                <Card hover className="p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Cash Balance</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">$39,260.00</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96">
                    <h3 className="text-lg font-semibold mb-4">Portfolio composition</h3>
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Chart Placeholder
                    </div>
                </Card>
                <Card className="h-96">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">NVDA</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Buy NVDA</p>
                                        <p className="text-sm text-gray-500">2 shares @ $135.00</p>
                                    </div>
                                </div>
                                <span className="font-medium text-gray-900">-$270.00</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
