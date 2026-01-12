import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, hover = false, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={cn(
                "bg-white rounded-2xl p-6 shadow-sm border border-gray-100",
                hover && "hover:shadow-xl hover:shadow-gray-200/50 transition-shadow duration-300",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);
