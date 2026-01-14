/**
 * UI Input Component
 * 
 * Reusable form input component with consistent styling.
 * 
 * Last Modified: 2026-01-14
 */
import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, error, ...props }, ref) => {
    return (
        <div className="w-full">
            <input
                ref={ref}
                className={cn(
                    "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:bg-gray-100/50",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
