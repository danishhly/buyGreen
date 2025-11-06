// src/components/Navbar.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useCart } from '../Hooks/UseCart';

const Navbar = () => {
    const { cartCount } = useCart();
    const [customer, setCustomer] = useState(null);
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

    // 2. This function is now cleaned up
    const handleLogout = () => {
        localStorage.removeItem('customer');
        localStorage.removeItem('token'); // This is the other item to remove
        setCustomer(null);
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* LEFT SECTION: Logo and Main Nav Links */}
                    <div className="flex items-center">
                        <div className="shrink-0">
                            {/* 3. Logo now links to CustomerHome */}
                            <Link to="/CustomerHome" className="text-2xl font-bold text-green-700">
                                BuyGreen
                            </Link>
                        </div>
                        <div className="hidden md:block ml-6">
                            <ul className="flex items-center gap-6 text-sm">
                                
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT SECTION: Profile, Cart Icon and Auth Buttons */}
                    <div className="flex items-center gap-4">

                        {/* 1. MOVED & STYLED Profile button is here now */}
                        {customer && (
                            <Link
                                to="/profile"
                                className="hidden sm:inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                            > <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-user">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
                                <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" /></svg>
                            </Link>
                        )}
                        
                        <Link to="/cart" className="relative text-gray-600 hover:text-green-700 p-2 rounded-md">
                            {/* ... cart svg ... */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-shopping-cart"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 2a1 1 0 0 1 .993 .883l.007 .117v1.068l13.071 .935a1 1 0 0 1 .929 1.024l-.01 .114l-1 7a1 1 0 0 1 -.877 .853l-.113 .006h-12v2h10a3 3 0 1 1 -2.995 3.176l-.005 -.176l.005 -.176c.017 -.288 .074 -.564 .166 -.824h-5.342a3 3 0 1 1 -5.824 1.176l-.005 -.176l.005 -.176a3.002 3.002 0 0 1 1.995 -2.654v-12.17h-1a1 1 0 0 1 -.993 -.883l-.007 -.117a1 1 0 0 1 .883 -.993l.117 -.007h2zm0 16a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm11 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2z" /></svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-700 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* This is the Login/Logout button logic */}
                        {customer ? (
                            <button
                                onClick={handleLogout}
                                className="rounded-md bg-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                             <Link to="/login" className="rounded-md bg-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 transition-colors">
                                Login
                            </Link>
                        )}
                        
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;