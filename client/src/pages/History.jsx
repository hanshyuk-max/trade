/**
 * Transaction History Page
 * 
 * Displays list of past trades and transactions.
 * 
 * Last Modified: 2026-01-14
 */
import React from 'react';
import { Card } from '../components/ui/Card';

const History = () => {
    const transactions = [
        { id: 1, date: '2025-12-28', symbol: 'NVDA', type: 'Buy', qty: 2, price: 135.00, total: 270.00, status: 'Completed' },
        { id: 2, date: '2025-12-15', symbol: 'AAPL', type: 'Buy', qty: 10, price: 230.50, total: 2305.00, status: 'Completed' },
        { id: 3, date: '2025-11-20', symbol: 'TSLA', type: 'Sell', qty: 5, price: 350.00, total: 1750.00, status: 'Completed' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">History</h1>
                <p className="text-gray-500 mt-1">Transaction records</p>
            </header>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Symbol</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 text-sm text-gray-900">{tx.date}</td>
                                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">{tx.symbol}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'Buy' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-900 text-right">{tx.qty}</td>
                                    <td className="py-4 px-6 text-sm text-gray-900 text-right">${tx.price.toFixed(2)}</td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900 text-right">${tx.total.toFixed(2)}</td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="text-xs text-green-600 font-medium">● {tx.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
export default History;
