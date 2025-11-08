import React from 'react';

/**
 * Logo Component
 * Reusable logo component that displays "buygreen." as text
 * @param {string} className - Additional CSS classes to apply
 */
const Logo = ({ 
    className = "" 
}) => {
    return (
        <span 
            className={`font-bold tracking-tight ${className}`}
            style={{
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
                letterSpacing: '-0.025em',
                fontWeight: 700,
                lineHeight: '1.2'
            }}
        >
            <span 
                className="text-gray-900"
                style={{
                    fontWeight: 700
                }}
            >
                buy
            </span>
            <span 
                className="text-green-600"
                style={{
                    fontWeight: 700
                }}
            >
                <span
                    style={{
                        fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
                        fontStyle: 'italic',
                        fontWeight: 700
                    }}
                >
                    g
                </span>
                reen.
            </span>
        </span>
    );
};

export default Logo;