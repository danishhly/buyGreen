// src/components/Navbar.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useCart } from '../Hooks/UseCart';

const Navbar = () => {
    const { cartCount } = useCart();
    const [customer, setCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            try {
                setCustomer(JSON.parse(storedCustomer));
            } catch (err) {
                console.error('Failed to parse stored customer', err);
                setCustomer(null);
            }
        } else {
            setCustomer(null);
        }
    }, [location]); 

    const handleLogout = () => {
        localStorage.removeItem('customer');
        localStorage.removeItem('token');
        localStorage.removeItem('customerId');
        localStorage.removeItem('customerName');
        localStorage.removeItem('Role');
        setCustomer(null);
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/CustomerHome?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const navCategories = [
        { name: "WHAT'S NEW", path: "/CustomerHome" },
        { name: "ALL PRODUCTS", path: "/CustomerHome" },
        { name: "SALE", path: "/CustomerHome" },
    ];

    return (
        <>
            {/* Top Header Bar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Top Row: Logo, Search, Icons */}
                    <div className="flex h-20 items-center justify-between">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link to="/CustomerHome" className="text-3xl font-bold text-gray-900 hover:text-green-700 transition-colors">
                                BuyGreen.
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        {/* Right Icons */}
                        <div className="flex items-center gap-4">
                            {/* Account Icon */}
                            {customer && (
                                <Link
                                    to="/profile"
                                    className="text-gray-600 hover:text-green-700 transition-colors p-2"
                                    title="Account"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </Link>
                            )}

                            {/* Wishlist Icon */}
                            <button
                                className="text-gray-600 hover:text-green-700 transition-colors p-2 relative"
                                title="Wishlist"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </button>

                            {/* Cart Icon */}
                            <Link 
                                to="/cart" 
                                className="relative text-gray-600 hover:text-green-700 transition-colors p-2"
                                title="Shopping Bag"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-green-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Login/Logout */}
                            {customer ? (
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Navigation Categories */}
                    <div className="hidden md:flex items-center justify-center border-t border-gray-200">
                        <ul className="flex items-center gap-8 py-4">
                            {navCategories.map((category) => (
                                <li key={category.name}>
                                    <Link
                                        to={category.path}
                                        className="text-sm font-medium text-gray-700 hover:text-green-700 transition-colors uppercase tracking-wide"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
};

export default Navbar;
