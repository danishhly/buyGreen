import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { getRecommendedCategories } from '../utils/productHistory';

const ProductRecommendations = ({ limit = 6 }) => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                // Get recommended categories from viewing history
                const categories = getRecommendedCategories();
                
                if (categories.length === 0) {
                    // If no viewing history, show random products
                    const response = await api.get(`/products/all?page=0&size=${limit}`);
                    setRecommendedProducts(response.data.content || []);
                } else {
                    // Fetch products from recommended categories
                    const allProducts = [];
                    for (const category of categories.slice(0, 2)) {
                        try {
                            const response = await api.get(`/products/all?page=0&size=${Math.ceil(limit / categories.length)}`);
                            const categoryProducts = (response.data.content || []).filter(
                                p => p.category && p.category.toLowerCase() === category.toLowerCase()
                            );
                            allProducts.push(...categoryProducts);
                        } catch (err) {
                            console.error(`Error fetching products for category ${category}:`, err);
                        }
                    }
                    
                    // If we don't have enough, fill with random products
                    if (allProducts.length < limit) {
                        const response = await api.get(`/products/all?page=0&size=${limit}`);
                        const randomProducts = (response.data.content || []).filter(
                            p => !allProducts.some(ap => ap.id === p.id)
                        );
                        allProducts.push(...randomProducts.slice(0, limit - allProducts.length));
                    }
                    
                    setRecommendedProducts(allProducts.slice(0, limit));
                }
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                setRecommendedProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [limit]);

    if (isLoading) {
        return (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommended for You</h2>
                    <p className="text-gray-600">Based on your browsing history</p>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-700"></div>
                </div>
            </section>
        );
    }

    if (recommendedProducts.length === 0) {
        return null;
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-green-50 rounded-2xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Recommended for You
                </h2>
                <p className="text-gray-600">Based on your browsing history</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProducts.map((product) => (
                    <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                        <div className="relative aspect-square bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                            {product.imageUrl || (product.imageUrls && product.imageUrls.length > 0) ? (
                                <img
                                    src={product.imageUrl || product.imageUrls[0]}
                                    alt={product.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            {product.stockQuantity <= 0 && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-white font-bold text-sm uppercase tracking-wide">Out of Stock</span>
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                                {product.category || 'Product'}
                            </p>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-green-600">
                                    ₹{typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Could add quick add to cart here
                                    }}
                                    className="px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ProductRecommendations;

