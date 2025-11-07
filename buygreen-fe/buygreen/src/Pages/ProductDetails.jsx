import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../Hooks/UseCart';
import ImageSlider from '../Component/ImageSlider'

const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 gradient-green rounded-full opacity-20 animate-pulse"></div>
            </div>
        </div>
    </div>
);

const StockDisplay = ({ stock }) => {
    if (stock > 10) {
        return (
            <div className="flex items-center gap-2 text-green-600 font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                In Stock
            </div>
        );
    }
    if (stock > 0) {
        return (
            <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                <svg className="w-5 h-5 animate-bounce-subtle" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Only {stock} left!
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 text-red-600 font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Out of Stock
        </div>
    );
};

const HeartIcon = ({ inWishlist }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={inWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={`w-6 h-6 transition-all ${
            inWishlist
                ? 'text-red-500 fill-red-500 scale-110'
                : 'text-gray-400 hover:text-red-400'
        }`}
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);

    const { productId } = useParams();
    const { addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (product) {
            const inList = wishlistItems.some(item => item.productId === product.id);
            setIsInWishlist(inList);
        }
    }, [wishlistItems, product]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
                setFetchError(null);
            } catch (err) {
                console.error("Error fetching product:", err);
                setFetchError(err.message || "Failed to load product");
                setProduct(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productId, navigate]);

    const handleIncrease = () => {
        if (quantity < product.stockQuantity) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        if (!product) {
            alert("Product information is not available. Please try refreshing the page.");
            return;
        }
        
        try {
            await addToCart(product, quantity);
            alert(`${quantity} x ${product.name} added to cart! ✅`);
        } catch (err) {
            console.error("Error adding to cart:", err);
            if (err.message && (err.message.includes("Not enough stock") || err.message.includes("User is not logged in"))) {
                alert(err.message);
            } else {
                alert("Please log in to add items to your cart.");
                navigate('/login');
            }
        }
    };

    const handleWishlistToggle = async () => {
        if (!product) {
            alert("Product information is not available. Please try refreshing the page.");
            return;
        }
        
        const storedCustomer = localStorage.getItem('customer');
        if (!storedCustomer) {
            alert("Please log in to add items to your wishlist.");
            navigate("/login");
            return;
        }

        try {
            if (isInWishlist) {
                await removeFromWishlist(product.id);
            } else {
                await addToWishlist(product.id);
            }
        } catch (err) {
            console.error("Wishlist error:", err);
            if (err.message && err.message.includes("User is not logged in")) {
                alert("Please log in to manage your wishlist.");
                navigate("/login");
            } else {
                alert(err.message || "Failed to update wishlist. Please try again.");
            }
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (fetchError || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
                    <div className="w-20 h-20 gradient-green rounded-full flex items-center justify-center 
                                  mx-auto mb-6 opacity-20">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {fetchError ? 'Unable to Load Product' : 'Product Not Found'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {fetchError || "The product you're looking for doesn't exist or has been removed."}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg 
                                     hover:border-gray-400 hover:bg-gray-50 transition-all font-medium"
                        >
                            Try Again
                        </button>
                        <Link
                            to="/CustomerHome"
                            className="px-5 py-2.5 gradient-green text-white rounded-lg font-semibold
                                     hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            Back to Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const isOutOfStock = product.stockQuantity <= 0;
    const productImages = (product.imageUrls && product.imageUrls.length > 0)
        ? product.imageUrls
        : [
            product.imageUrl || 'https://via.placeholder.com/600x600?text=Product+Image',
            'https://via.placeholder.com/600x600/eeeeee/999999?text=Image+2',
            'https://via.placeholder.com/600x600/eeeeee/999999?text=Image+3'
        ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    to="/CustomerHome"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-8 
                             transition-colors group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" 
                         stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Shop
                </Link>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-12">
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <div className="aspect-square">
                                <ImageSlider images={productImages} />
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-3">
                                {product.category || 'Product'}
                            </p>

                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                {product.name}
                            </h1>

                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                {product.description || 'No description available.'}
                            </p>

                            <div className="mb-6">
                                <StockDisplay stock={product.stockQuantity} />
                            </div>

                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-5xl font-bold text-green-600">
                                    ${product.price.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <label className="text-lg font-semibold text-gray-700">Quantity:</label>
                                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={handleDecrease}
                                        className="px-5 py-3 text-xl font-bold text-gray-700 hover:bg-gray-100 
                                                 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <span className="px-6 py-3 text-xl font-bold text-gray-900 min-w-[4rem] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={handleIncrease}
                                        className="px-5 py-3 text-xl font-bold text-gray-700 hover:bg-gray-100 
                                                 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={quantity >= product.stockQuantity}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-1 gradient-green text-white py-4 px-8 rounded-xl font-bold text-lg
                                             hover:shadow-2xl hover:scale-105 transition-all duration-300
                                             disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100
                                             flex items-center justify-center gap-3"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </button>

                                <button
                                    onClick={handleWishlistToggle}
                                    className={`p-4 border-2 rounded-xl transition-all hover:scale-110 ${
                                        isInWishlist
                                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                    }`}
                                    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                >
                                    <HeartIcon inWishlist={isInWishlist} />
                                </button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Product Features</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-gray-600">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Eco-friendly and sustainable
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-600">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        High quality materials
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-600">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Free shipping on orders over $50
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
