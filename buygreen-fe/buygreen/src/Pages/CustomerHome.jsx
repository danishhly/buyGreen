import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../Hooks/UseCart';
import { useToast } from '../Component/Toast';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 gradient-green rounded-full opacity-20 animate-pulse"></div>
            </div>
        </div>
    </div>
);

// pagination control

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center items-center gap-4 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                &larr; previous
            </button>
            <span className="text-gray-700 font-medium">
                Page {currentPage + 1} of {totalPages}
            </span>
            <button onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
                className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Next &rarr;
            </button>
        </div>
    )
}

const CustomerHome = () => {
    const { success, error, warning } = useToast();
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    const [isVisible, setIsVisible] = useState(false);

    // Contact form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const PRODUCTS_PER_PAGE = 12;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        const categoryParam = params.get('category');
        setSearchTerm(searchParam || "");
        setSelectedCategory(categoryParam || "");
    }, [location]);


    useEffect(() => {
        setIsLoadingProducts(true);
        // Use search endpoint if there's a search term, otherwise use regular endpoint
        let apiCall;
        if (searchTerm && searchTerm.trim() !== "") {
            apiCall = api.get(`/products/search?query=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=${PRODUCTS_PER_PAGE}`);
        } else {
            apiCall = api.get(`/products/all?page=${currentPage}&size=${PRODUCTS_PER_PAGE}`);
        }

        apiCall
            .then((res) => {
                const products = Array.isArray(res.data.content) ? res.data.content : [];
                setAllProducts(products);

                // Apply category filter if selected
                let productsToShow = products;
                if (selectedCategory && selectedCategory.trim() !== "") {
                    productsToShow = products.filter(product => {
                        const category = product && product.category != null ? String(product.category) : "";
                        return category.toLowerCase() === selectedCategory.toLowerCase();
                    });
                }

                setFilteredProducts(productsToShow);
                setTotalPages(res.data.totalPages);
                setTotalProducts(res.data.totalElements);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
                setAllProducts([]);
                setFilteredProducts([]);
                setTotalPages(0);
                setTotalProducts(0);
            })
            .finally(() => setIsLoadingProducts(false));
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            try {
                setCustomer(JSON.parse(storedCustomer));
            } catch (err) {
                setCustomer(null);
            }
        }
    }, [location]);

    // Apply category filter when category changes
    useEffect(() => {
        if (selectedCategory && selectedCategory.trim() !== "") {
            const filtered = allProducts.filter(product => {
                const category = product && product.category != null ? String(product.category) : "";
                return category.toLowerCase() === selectedCategory.toLowerCase();
            });
            setFilteredProducts(filtered);
            // Update total products count for filtered results
            setTotalProducts(filtered.length);
            setTotalPages(Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
        } else {
            setFilteredProducts(allProducts);
            // Reset to original total when no category filter
            if (allProducts.length > 0) {
                // We need to refetch to get the correct total
                api.get(`/products/all?page=0&size=1`)
                    .then((res) => {
                        setTotalProducts(res.data.totalElements);
                        setTotalPages(res.data.totalPages);
                    })
                    .catch(() => { });
            }
        }
    }, [selectedCategory, allProducts]);

    const handleAddToCart = async (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!customer) {
            warning("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }
        try {
            await addToCart(product, 1);
            success(`${product.name} added to cart!`);
        } catch (err) {
            console.error("Error adding to cart:", err);
            error("Failed to add item to cart. Please try again.");
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Scroll to top of products section
        setTimeout(() => {
            const productsSection = document.getElementById('featured-products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo(0, 0);
            }
        }, 100);
    };

    useEffect(() => {
        // Trigger animation after component mounts
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear status message when user starts typing
        if (submitStatus) {
            setSubmitStatus(null);
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Simulate API call - Replace this with actual API endpoint when available
            // const response = await api.post('/contact', formData);

            // For now, simulate a delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Log the form data (in production, this would be sent to your backend)
            console.log('Contact form submission:', formData);

            // Show success message
            setSubmitStatus('success');

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 5000);

            // Optional: Scroll to show success message
            const formElement = e.target;
            formElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (error) {
            console.error('Error submitting contact form:', error);
            setSubmitStatus('error');

            // Clear error message after 5 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Side - Hero Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div
                            className={`inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full transition-all duration-1000 delay-200 ${isVisible
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 -translate-y-4'
                                }`}
                        >
                            <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-green-700">100% Eco-Friendly Products</span>
                        </div>

                        {/* Headline */}
                        <h1
                            className={`text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight transition-all duration-1000 delay-300 ${isVisible
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 -translate-x-8'
                                }`}
                        >
                            <span className="text-gray-900">Shop Green,</span>
                            <br />
                            <span className="text-green-600">Live Better</span>
                        </h1>

                        {/* Description */}
                        <p
                            className={`text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg transition-all duration-1000 delay-400 ${isVisible
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-8'
                                }`}
                        >
                            Discover sustainable products that make a difference. Every purchase helps protect our planet.
                        </p>

                        {/* CTA Buttons */}
                        <div
                            className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-500 ${isVisible
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-4'
                                }`}
                        >
                            <button
                                onClick={() => {
                                    const productsSection = document.getElementById('featured-products');
                                    if (productsSection) {
                                        productsSection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Shop Now
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                            <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-300">
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Feature Cards & Banner */}
                    <div
                        className={`space-y-6 transition-all duration-1000 delay-600 ${isVisible
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 translate-x-8'
                            }`}
                    >
                        {/* Feature Cards */}
                        <div className="space-y-4">
                            {/* Eco-Friendly Card */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow transform hover:scale-105">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Eco-Friendly</h3>
                                        <p className="text-sm text-gray-600">All products made from sustainable materials</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quality First Card */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow transform hover:scale-105">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Quality First</h3>
                                        <p className="text-sm text-gray-600">Premium sustainable products built to last</p>
                                    </div>
                                </div>
                            </div>

                            {/* Zero Waste Card */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow transform hover:scale-105">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Zero Waste</h3>
                                        <p className="text-sm text-gray-600">Recyclable packaging and carbon neutral shipping</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Promotional Banner */}
                        <div className="bg-green-600 rounded-xl p-8 text-white transform hover:scale-105 transition-transform duration-300">
                            <div className="text-5xl font-bold mb-2">30%</div>
                            <p className="text-green-50 text-sm">Average carbon footprint reduction with our products</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-green-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* 100% Sustainable */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">100% Sustainable</h3>
                            <p className="text-sm text-gray-600">All products are made from eco-friendly, renewable materials</p>
                        </div>

                        {/* Carbon Neutral Shipping */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Carbon Neutral Shipping</h3>
                            <p className="text-sm text-gray-600">Free shipping with zero carbon footprint on orders over ₹50</p>
                        </div>

                        {/* Quality Guarantee */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Guarantee</h3>
                            <p className="text-sm text-gray-600">30-day money-back guarantee on all purchases</p>
                        </div>

                        {/* Zero Waste Packaging */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Zero Waste Packaging</h3>
                            <p className="text-sm text-gray-600">100% recyclable and biodegradable packaging materials</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section id="featured-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-bold text-gray-900">Featured Products</h2>
                    {!isLoadingProducts && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="text-sm font-semibold text-green-700">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    {(searchTerm || selectedCategory) && (
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex flex-wrap items-center gap-4">
                                {searchTerm && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Search:</span>
                                        <span className="px-3 py-1 bg-white border border-green-200 rounded-full text-sm font-semibold text-green-700">
                                            "{searchTerm}"
                                        </span>
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                const params = new URLSearchParams(location.search);
                                                params.delete('search');
                                                navigate({ search: params.toString() });
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                {selectedCategory && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Category:</span>
                                        <span className="px-3 py-1 bg-white border border-green-200 rounded-full text-sm font-semibold text-green-700 uppercase">
                                            {selectedCategory}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setSelectedCategory("");
                                                const params = new URLSearchParams(location.search);
                                                params.delete('category');
                                                navigate({ search: params.toString() });
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                {(searchTerm || selectedCategory) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedCategory("");
                                            navigate('/CustomerHome');
                                        }}
                                        className="ml-auto px-4 py-1.5 text-sm font-semibold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {isLoadingProducts ? (
                        <LoadingSpinner />
                    ) : filteredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {filteredProducts.map((product) => (
                                    <Link
                                        to={`/product/${product.id}`}
                                        key={product.id}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl 
                                         transition-all duration-300 border border-gray-100 hover-lift"
                                    >
                                        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 aspect-square">
                                            <img
                                                src={product.imageUrl || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=')}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                                }}
                                            />
                                            {product.stockQuantity <= 0 && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg uppercase tracking-wide">Out of Stock</span>
                                                </div>
                                            )}
                                            {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                                                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold 
                                                      px-3 py-1 rounded-full shadow-lg animate-bounce-subtle">
                                                    Only {product.stockQuantity} left!
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                                                {product.category || 'Product'}
                                            </p>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 
                                                 group-hover:text-green-600 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-2xl font-bold text-green-600">
                                                    ₹{product.price.toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={(e) => handleAddToCart(product, e)}
                                                    disabled={product.stockQuantity <= 0}
                                                    className="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-lg 
                                                     hover:bg-green-800 hover:shadow-lg hover:scale-105 transition-all duration-300
                                                     disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100
                                                     flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                            <div className="w-24 h-24 gradient-green rounded-full flex items-center justify-center 
                                      mx-auto mb-6 opacity-20">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                {searchTerm || selectedCategory
                                    ? "Try adjusting your search or filter criteria."
                                    : "No products available at the moment."}
                            </p>
                            {(searchTerm || selectedCategory) && (
                                <button
                                    onClick={() => {
                                        navigate('/CustomerHome');
                                    }}
                                    className="px-6 py-3 gradient-green text-white rounded-full font-semibold 
                                         hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="bg-white py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">About Us</h2>
                        <div className="w-24 h-1 bg-green-600 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                At buygreen., we are committed to making sustainable living accessible to everyone.
                                Our mission is to provide high-quality, eco-friendly products that help you reduce
                                your environmental footprint while maintaining the lifestyle you love.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                We carefully curate every product in our collection, ensuring they meet our strict
                                sustainability standards. From biodegradable materials to carbon-neutral shipping,
                                every aspect of our business is designed with the planet in mind.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Why Choose Us</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-lg text-gray-600">100% sustainable and eco-friendly products</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-lg text-gray-600">Carbon-neutral shipping on all orders</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-lg text-gray-600">Zero-waste packaging materials</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-lg text-gray-600">30-day money-back guarantee</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="bg-green-50 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Contact Us</h2>
                        <div className="w-24 h-1 bg-green-600 mx-auto"></div>
                        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                            Have a question or need assistance? We're here to help! Reach out to us through any of the following ways.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                                            <a href="mailto:contact@buygreen.com" className="text-gray-600 hover:text-green-600 transition-colors">
                                                contact@buygreen.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                                            <a href="tel:+1234567890" className="text-gray-600 hover:text-green-600 transition-colors">
                                                +1 (234) 567-890
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                                            <p className="text-gray-600">
                                                123 Green Street<br />
                                                Eco City, EC 12345<br />
                                                United States
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="pt-6 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-4">Business Hours</h4>
                                <div className="space-y-2 text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span>9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span>10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span>Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>

                            {/* Success Message */}
                            {submitStatus === 'success' && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-green-800 font-semibold">Message sent successfully!</p>
                                            <p className="text-green-700 text-sm mt-1">We'll get back to you soon.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {submitStatus === 'error' && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-red-800 font-semibold">Failed to send message</p>
                                            <p className="text-red-700 text-sm mt-1">Please try again later.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form
                                onSubmit={handleContactSubmit}
                                className="space-y-6"
                            >
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Your name"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="your.email@example.com"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="What's this about?"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                        placeholder="Tell us how we can help..."
                                        disabled={isSubmitting}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Message'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomerHome;