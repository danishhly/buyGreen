import React from 'react';
import Logo from './Logo';

const AdminFooter = () => {
    return (
        <footer className="bg-gray-900 text-white border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Logo className="text-3xl text-white" />
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Admin Dashboard for buygreen. Manage products, orders, and customers with ease.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/AdminDashboard" className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="/AdminDashboard#products" className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200">
                                    Manage Products
                                </a>
                            </li>
                            <li>
                                <a href="/AdminDashboard#orders" className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200">
                                    View Orders
                                </a>
                            </li>
                            <li>
                                <a href="/AdminDashboard#customers" className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200">
                                    Manage Customers
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Admin Info */}
                    <div>
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Admin Panel</h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-gray-400">
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                                        <path d="M9 12l2 2 4-4"></path>
                                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                        <path d="M12 21c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                        <path d="M12 3c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                    </svg>
                                    Secure Admin Access
                                </span>
                            </li>
                            <li className="text-sm text-gray-400">
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Protected Routes
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
                        <p>© {new Date().getFullYear()} buygreen. Admin Dashboard. All rights reserved.</p>
                        <p className="mt-2 sm:mt-0">For support, contact system administrator.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AdminFooter;

