import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../Hooks/UseCart';
import Logo from './Logo';

const Navbar = () => {
    const { cartCount, wishlistCount } = useCart();
    const [customer, setCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            setSearchQuery(searchParam);
        } else if (location.pathname === '/CustomerHome') {
            setSearchQuery('');
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
        { name: "WHAT'S NEW", path: "/CustomerHome", category: "new" },
        { name: "ALL PRODUCTS", path: "/CustomerHome", category: "" },
        { name: "SALE", path: "/CustomerHome", category: "sale" },
    ];

    const handleCategoryClick = (category) => {
        setSearchQuery('');
        if (category) {
            navigate(`/CustomerHome?category=${encodeURIComponent(category)}`);
        } else {
            navigate('/CustomerHome');
        }
        setMobileMenuOpen(false);
        // Scroll to top when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAboutClick = () => {
        if (location.pathname === '/CustomerHome') {
            // If already on CustomerHome, scroll to about section
            setTimeout(() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            navigate('/CustomerHome');
            setTimeout(() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
        setMobileMenuOpen(false);
    };

    const handleContactClick = () => {
        if (location.pathname === '/CustomerHome') {
            // If already on CustomerHome, scroll to contact section
            setTimeout(() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            navigate('/CustomerHome');
            setTimeout(() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
        setMobileMenuOpen(false);
    };

    const handleHomeClick = () => {
        navigate('/CustomerHome');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                isScrolled 
                    ? 'glass-morphism shadow-lg' 
                    : 'bg-white border-b border-gray-100'
            }`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        <div className="flex-shrink-0 group">
                            <Link 
                                to="/CustomerHome" 
                                className="flex items-center hover:opacity-80 transition-all duration-300"
                            >
                                <Logo className="text-3xl" />
                            </Link>
                        </div>

                        <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
                            <form onSubmit={handleSearch} className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search for eco-friendly products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-6 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-full 
                                             focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none
                                             transition-all duration-300 group-hover:border-green-300"
                                />
                                <button
                                    type="submit"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        <div className="flex items-center gap-3">
                            {customer && (
                                <Link
                                    to="/profile"
                                    className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-green-600 
                                             transition-all duration-300 rounded-lg hover:bg-green-50"
                                    title="Account"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full 
                                                  flex items-center justify-center text-white font-semibold shadow-md">
                                        {customer.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden xl:block text-sm font-medium">{customer.name || 'Account'}</span>
                                </Link>
                            )}

                            <Link
                                to="/wishlist"
                                className="relative p-2.5 text-gray-600 hover:text-green-600 transition-all duration-300 
                                         rounded-lg hover:bg-green-50 group"
                                title="Wishlist"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:scale-110 transition-transform" 
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold 
                                                   rounded-full h-5 w-5 flex items-center justify-center shadow-lg 
                                                   border-2 border-white min-w-[20px]">
                                        {wishlistCount > 99 ? '99+' : wishlistCount}
                                    </span>
                                )}
                            </Link>

                            <Link 
                                to="/cart" 
                                className="relative p-2.5 text-gray-600 hover:text-green-600 transition-all duration-300 
                                         rounded-lg hover:bg-green-50 group"
                                title="Shopping Bag"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:scale-110 transition-transform" 
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold 
                                                   rounded-full h-5 w-5 flex items-center justify-center shadow-lg 
                                                   border-2 border-white min-w-[20px] z-10">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {customer ? (
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:block px-5 py-2.5 text-sm font-medium text-gray-700 
                                             hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                                >
                                    Logout
                                </button>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="px-6 py-2.5 text-sm font-semibold text-white gradient-green 
                                             rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    Login
                                </Link>
                            )}

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center border-t border-gray-100">
                        <ul className="flex items-center gap-8 py-4">
                            <li>
                                <button
                                    onClick={handleHomeClick}
                                    className="relative text-sm font-semibold text-gray-700 hover:text-green-600 
                                             transition-colors group"
                                >
                                    Home
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 
                                                   group-hover:w-full transition-all duration-300"></span>
                                </button>
                            </li>
                            {navCategories.map((category) => (
                                <li key={category.name}>
                                    <button
                                        onClick={() => handleCategoryClick(category.category)}
                                        className="relative text-sm font-semibold text-gray-700 hover:text-green-600 
                                                 transition-colors uppercase tracking-wide group"
                                    >
                                        {category.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 
                                                       group-hover:w-full transition-all duration-300"></span>
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={handleAboutClick}
                                    className="relative text-sm font-semibold text-gray-700 hover:text-green-600 
                                             transition-colors group"
                                >
                                    About
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 
                                                   group-hover:w-full transition-all duration-300"></span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleContactClick}
                                    className="relative text-sm font-semibold text-gray-700 hover:text-green-600 
                                             transition-colors group"
                                >
                                    Contact
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 
                                                   group-hover:w-full transition-all duration-300"></span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down">
                        <div className="px-4 py-4 space-y-3">
                            <form onSubmit={handleSearch} className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg 
                                             focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                            <button
                                onClick={handleHomeClick}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 
                                         hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                            >
                                Home
                            </button>
                            {navCategories.map((category) => (
                                <button
                                    key={category.name}
                                    onClick={() => handleCategoryClick(category.category)}
                                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 
                                             hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                >
                                    {category.name}
                                </button>
                            ))}
                            <button
                                onClick={handleAboutClick}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 
                                         hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                            >
                                About
                            </button>
                            <button
                                onClick={handleContactClick}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 
                                         hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                            >
                                Contact
                            </button>
                        </div>
                    </div>
                )}
            </nav>
            <div className="h-36 lg:h-[140px]"></div>
        </>
    );
};

export default Navbar;