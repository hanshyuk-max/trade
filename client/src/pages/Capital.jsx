import React from 'react';
import { Card } from '../components/ui/Card';

const Capital = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Capital & Retirement</h1>
                <p className="text-gray-500 mt-1">Track your progress towards financial freedom</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FIRE GOAL */}
                <Card className="col-span-full md:col-span-1 p-6">
                    <h3 className="text-lg font-semibold mb-6">Retirement Goal (FIRE)</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-bold text-blue-600">12.4%</span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '12.4%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>$124,500</span>
                                <span>Goal: $1,000,000</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="col-span-full md:col-span-1 p-6">
                    <h3 className="text-lg font-semibold mb-6">Annual Dividends</h3>
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-50 rounded-2xl">
                            <span className="text-2xl font-bold text-green-600">$1,240</span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Estimated annual income from current portfolio
                        </div>
                    </div>
                </Card>

                {/* Asset Allocation */}
                <Card className="col-span-full p-6">
                    <h3 className="text-lg font-semibold mb-6">Asset Allocation</h3>
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="text-sm text-gray-500">US Stocks</div>
                            <div className="h-2 bg-blue-500 rounded-full"></div>
                            <div className="font-medium">68%</div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="text-sm text-gray-500">Cash</div>
                            <div className="h-2 bg-gray-300 rounded-full"></div>
                            <div className="font-medium">32%</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
export default Capital;
