import React from 'react';

const Logo = ({ className = "" }) => {
    return (
        <svg
            width="220"
            height="80"
            viewBox="0 0 500 150"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Hexagon background */}
            <polygon
                points="70,10 130,40 130,100 70,130 10,100 10,40"
                fill="none"
                stroke="#8DC63F"
                strokeWidth="6"
            />
            {/* Shopping cart */}
            <g transform="translate(40,55)">
                <rect x="0" y="15" width="40" height="20" fill="none" stroke="#4D4D4D" strokeWidth="3" />
                <line x1="0" y1="15" x2="-5" y2="0" stroke="#4D4D4D" strokeWidth="3" />
                <line x1="40" y1="15" x2="45" y2="0" stroke="#4D4D4D" strokeWidth="3" />
                <circle cx="10" cy="40" r="4" fill="#8DC63F" />
                <circle cx="30" cy="40" r="4" fill="#8DC63F" />
            </g>
            {/* Tree on top of cart */}
            <g transform="translate(60,30)">
                <path
                    d="M0 20 C -10 10, -10 -10, 10 -10 C 20 -10, 20 10, 10 20 Z"
                    fill="#6BBE44"
                />
                <rect x="8" y="20" width="4" height="10" fill="#4D4D4D" />
            </g>
            {/* BuyGreen text */}
            <text x="160" y="85" fontFamily="Poppins, sans-serif" fontSize="38" fontWeight="600" fill="#4D4D4D">
                buy
                <tspan fill="#8DC63F">Green</tspan>
                <tspan fill="#8DC63F">.</tspan>
            </text>
        </svg>
    );
};

export default Logo;

