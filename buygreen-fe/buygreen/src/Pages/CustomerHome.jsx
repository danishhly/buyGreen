import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../Hooks/UseCart';

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

const Pagination = ({currentPage, totalPages, onPageChange }) => {
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
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const PRODUCTS_PER_PAGE = 10;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        const categoryParam = params.get('category');
        setSearchTerm(searchParam || "");
        setSelectedCategory(categoryParam || "");
    }, [location]);


    useEffect(() => {
        setIsLoadingProducts(true);
        api.get(`/products/all?page=${currentPage}&size=${PRODUCTS_PER_PAGE}`)
            .then((res) => {
                const products = Array.isArray(res.data.content) ? res.data.content : [];
                setAllProducts(products);
                setFilteredProducts(products);

                setTotalPages(res.data.totalPages);
                setTotalProducts(res.data.totalElements);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
                setAllProducts([]);
                setFilteredProducts([]);
            })
            .finally(() => setIsLoadingProducts(false));
    }, [currentPage]);

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
            console.error("Error adding to cart:", err);
            alert("Failed to add item to cart. Please try again.");
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0); 
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
                        Discover Eco-Friendly Products
                    </h1>
                    <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto">
                        Shop sustainable, green products that are good for you and the planet
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        {searchTerm && (
                            <p className="text-lg text-gray-700 mb-2">
                                Results for: <span className="font-semibold text-green-600">"{searchTerm}"</span>
                            </p>
                        )}
                        {selectedCategory && (
                            <p className="text-lg text-gray-700">
                                Category: <span className="font-semibold text-green-600 uppercase">{selectedCategory}</span>
                            </p>
                        )}
                        {!isLoadingProducts && (
                            <p className="text-sm text-gray-500 mt-2">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                            </p>
                        )}
                    </div>
                </div>

                {isLoadingProducts ? (
                    <LoadingSpinner />
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  {totalPages > 1 && (
                        <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        />
                    )}
            </main>
        </div>
    );
};

export default CustomerHome;