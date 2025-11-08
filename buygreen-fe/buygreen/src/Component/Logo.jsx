import React from 'react';

/**
 * Logo Component
 * Reusable logo component that displays the buygreen. logo
 * @param {string} className - Additional CSS classes to apply
 * @param {string} alt - Alt text for the logo (defaults to "buygreen. Logo")
 * @param {object} style - Additional inline styles
 */
const Logo = ({ 
    className = "", 
    alt = "buygreen. Logo",
    style = {}
}) => {
    const defaultStyle = {
        imageRendering: '-webkit-optimize-contrast',
        ...style
    };

    return (
        <img 
            src="/buygreen.svg" 
            alt={alt}
            className={className}
            style={defaultStyle}
        />
    );
};

export default Logo;

