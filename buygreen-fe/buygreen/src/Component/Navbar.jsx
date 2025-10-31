import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../Hooks/useCart';

const Navbar = () => {
    // Get the cart count from our global context
    const { cartCount } = useCart();

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Home Link */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-green-700">
                           BuyGreen
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>
                        
                        <Link to="/cart" className="relative text-gray-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            
                            {/* Cart count badge */}
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;