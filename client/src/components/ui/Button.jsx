import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Button = ({ children, className, variant = 'primary', ...props }) => {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30",
        secondary: "bg-white/10 hover:bg-white/20 text-gray-800 dark:text-gray-100 border border-white/20 backdrop-blur-md",
        outline: "border-2 border-blue-500 text-blue-600 hover:bg-blue-50",
        ghost: "hover:bg-gray-100 text-gray-700",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "px-6 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};
