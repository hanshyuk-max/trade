/**
 * Trading Page
 * 
 * Interface for executing buy/sell orders.
 * 
 * Last Modified: 2026-01-14
 */
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search } from 'lucide-react';

const Trade = () => {
    const [action, setAction] = useState('buy'); // buy or sell

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Trade</h1>
                <p className="text-gray-500 mt-1">Execute buy and sell orders</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trade Form */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                            <button
                                onClick={() => setAction('buy')}
                                className={`flex-1 py-2 text-center font-medium rounded-lg transition-all ${action === 'buy' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setAction('sell')}
                                className={`flex-1 py-2 text-center font-medium rounded-lg transition-all ${action === 'sell' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                Sell
                            </button>
                        </div>

                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                                    <Input placeholder="Search ticker (e.g. AAPL)" className="pl-12 uppercase" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                    <Input type="number" placeholder="0" min="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Type</label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                        <option>Market Order</option>
                                        <option>Limit Order</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-500">Estimated Cost</span>
                                    <span className="text-xl font-bold text-gray-900">$0.00</span>
                                </div>
                                <Button
                                    className="w-full py-4 text-lg bg-gray-900 hover:bg-black text-white"
                                    variant={action === 'buy' ? 'primary' : 'danger'}
                                >
                                    {action === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Market Data / Sidebar info */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="font-semibold mb-4">Market Status</h3>
                        <div className="flex items-center gap-2 text-green-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Market Open
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Nasdaq is currently trading.</p>
                    </Card>

                    <Card>
                        <h3 className="font-semibold mb-4">Your Position</h3>
                        <div className="text-center py-8 text-gray-400">
                            Enter symbol to view position
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
export default Trade;
