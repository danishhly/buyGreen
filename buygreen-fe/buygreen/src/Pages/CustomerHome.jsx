import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../Hooks/UseCart';

// --- LoadingSpinner ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
    </div>
);

const CustomerHome = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]); 
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);

    // Check for search query in URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            setSearchTerm(searchParam);
        }
    }, [location]);

    // Fetch products
    useEffect(() => {
        api.get("/products/all")
            .then((res) => {
                const products = Array.isArray(res.data) ? res.data : [];
                setAllProducts(products);
                setFilteredProducts(products);
                
                const uniqueCategories = [...new Set(
                    products
                        .map(p => (p && p.category != null ? String(p.category).trim() : ""))
                        .filter(Boolean)
                )];
                setCategories(uniqueCategories);
            })
            .catch((err) => console.error("Error fetching products:", err))
            .finally(() => setIsLoadingProducts(false));
    }, []);

    useEffect(() => {
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            setCustomer(JSON.parse(storedCustomer));
        } else {
            setCustomer(null);
        }
    }, [location]);

    // Filtering logic
    useEffect(() => {
        let productsToFilter = [...allProducts];

        if (searchTerm) {
            productsToFilter = productsToFilter.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedCategory) {
            productsToFilter = productsToFilter.filter(product => {
                const category = product && product.category != null ? String(product.category) : "";
                return category.toLowerCase() === selectedCategory.toLowerCase();
            });
        }

        setFilteredProducts(productsToFilter);
    }, [searchTerm, selectedCategory, allProducts]);

    const handleAddToCart = async (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!customer) {
            alert("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }
        try {
            await addToCart(product, 1);
            alert(`${product.name} ✅ added to cart!`);
        } catch (err) {
            console.log("went wrong", err);
            alert("Failed to add item to cart. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="text-sm">
                        <Link to="/CustomerHome" className="text-gray-500 hover:text-green-700">
                            HOME
                        </Link>
                        {selectedCategory && (
                            <>
                                <span className="mx-2 text-gray-400">/</span>
                                <span className="text-gray-900 uppercase">{selectedCategory}</span>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to BuyGreen</h1>
                        <p className="text-xl md:text-2xl text-green-50 mb-8">
                            Discover eco-friendly products for a sustainable lifestyle
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter Section */}
                <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory("")}
                            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                                selectedCategory === "" 
                                    ? 'bg-gray-900 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Products
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                                    selectedCategory === category 
                                        ? 'bg-gray-900 text-white shadow-md' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Count */}
                {!isLoadingProducts && (
                    <div className="mb-6">
                        <p className="text-gray-600">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                        </p>
                    </div>
                )}

                {/* Product Grid */}
                {isLoadingProducts ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <Link 
                                        to={`/product/${product.id}`} 
                                        key={product.id} 
                                        className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                                    >
                                        {/* Product Image */}
                                        <div className="relative overflow-hidden bg-gray-100 aspect-square">
                                            <img 
                                                src={product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {product.stockQuantity <= 0 && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg uppercase">Out of Stock</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                                {product.category || 'Product'}
                                            </p>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {product.description}
                                            </p>
                                            
                                            {/* Price */}
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ${product.price.toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Stock Status */}
                                            {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                                                <p className="text-xs text-yellow-600 font-semibold mb-3">
                                                    Only {product.stockQuantity} left!
                                                </p>
                                            )}

                                            {/* Add to Cart Button */}
                                            <button 
                                                onClick={(e) => handleAddToCart(product, e)}
                                                disabled={product.stockQuantity <= 0}
                                                className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                                </svg>
                                                {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Bag'}
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || selectedCategory 
                                        ? "Try adjusting your search or filter criteria."
                                        : "No products available at the moment."}
                                </p>
                                {(searchTerm || selectedCategory) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedCategory("");
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer Section */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                Free Shipping, Returns & Refunds
                            </h3>
                            <p className="text-sm text-gray-600">
                                We offer free shipping on all orders. Easy returns and refunds available.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                Eco-Friendly Products
                            </h3>
                            <p className="text-sm text-gray-600">
                                All our products are carefully selected for their environmental impact.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                Customer Support
                            </h3>
                            <p className="text-sm text-gray-600">
                                Need help? Contact our support team for assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CustomerHome;
