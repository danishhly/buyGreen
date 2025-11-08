import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../Hooks/UseCart';
import ImageSlider from '../Component/ImageSlider'
import ReviewList from '../Component/ReviewList.jsx';
import ReviewForm from '../Component/ReviewForm.jsx';
import { useToast } from '../Component/Toast';

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
        className={`w-6 h-6 transition-all ${inWishlist
            ? 'text-red-500 fill-red-500 scale-110'
            : 'text-gray-400 hover:text-red-400'
            }`}
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const ProductDetails = () => {
    const { success, error, warning } = useToast();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);

    const [reviewUpdateKey, setReviewUpdateKey] = useState(Date.now());

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

    const handleReviewSubmitted = () => {
        // Change the key, which will cause ReviewList to re-run its useEffect
        setReviewUpdateKey(Date.now());
    };

    const handleAddToCart = async () => {
        if (!product) {
            error("Product information is not available. Please try refreshing the page.");
            return;
        }

        try {
            await addToCart(product, quantity);
            success(`${quantity} x ${product.name} added to cart!`);
        } catch (err) {
            console.error("Error adding to cart:", err);
            if (err.message && (err.message.includes("Not enough stock") || err.message.includes("User is not logged in"))) {
                if (err.message.includes("Not enough stock")) {
                    warning(err.message);
                } else {
                    error(err.message);
                    navigate('/login');
                }
            } else {
                error("Please log in to add items to your cart.");
                navigate('/login');
            }
        }
    };



    const handleWishlistToggle = async () => {
        if (!product) {
            error("Product information is not available. Please try refreshing the page.");
            return;
        }

        const storedCustomer = localStorage.getItem('customer');
        if (!storedCustomer) {
            warning("Please log in to add items to your wishlist.");
            navigate("/login");
            return;
        }

        try {
            if (isInWishlist) {
                await removeFromWishlist(product.id);
                success("Removed from wishlist");
            } else {
                await addToWishlist(product.id);
                success("Added to wishlist");
            }
        } catch (err) {
            console.error("Wishlist error:", err);
            if (err.message && err.message.includes("User is not logged in")) {
                warning("Please log in to manage your wishlist.");
                navigate("/login");
            } else {
                error(err.message || "Failed to update wishlist. Please try again.");
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
            product.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg==',
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSAyPC90ZXh0Pjwvc3ZnPg==',
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSAzPC90ZXh0Pjwvc3ZnPg=='
        ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb Navigation */}
                <nav className="mb-8">
                    <Link
                        to="/CustomerHome"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 font-medium 
                                 transition-colors group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Shop
                    </Link>
                </nav>

                {/* Main Product Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-10">
                        {/* Product Image */}
                        <div className="order-1">
                            <div className="rounded-xl overflow-hidden shadow-md bg-gray-100">
                                <div className="aspect-square">
                                    <ImageSlider images={productImages} />
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="order-2 flex flex-col justify-center">
                            {/* Category Badge */}
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold 
                                               rounded-full uppercase tracking-wide">
                                    {product.category || 'Product'}
                                </span>
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                {product.name}
                            </h1>

                            {/* Description */}
                            <p className="text-base lg:text-lg text-gray-600 mb-6 leading-relaxed">
                                {product.description || 'No description available.'}
                            </p>

                            {/* Stock Status */}
                            <div className="mb-6">
                                <StockDisplay stock={product.stockQuantity} />
                            </div>

                            {/* Price */}
                            <div className="mb-8 pb-8 border-b border-gray-200">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl lg:text-5xl font-bold text-green-700">
                                        ₹{product.price.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden 
                                                  hover:border-green-500 transition-colors">
                                        <button
                                            onClick={handleDecrease}
                                            className="px-4 py-3 text-lg font-bold text-gray-700 hover:bg-gray-50 
                                                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span className="px-6 py-3 text-lg font-bold text-gray-900 min-w-[3.5rem] text-center 
                                                       border-x border-gray-300">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={handleIncrease}
                                            className="px-4 py-3 text-lg font-bold text-gray-700 hover:bg-gray-50 
                                                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            disabled={quantity >= product.stockQuantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                    {product.stockQuantity > 0 && (
                                        <span className="text-sm text-gray-500">
                                            {product.stockQuantity} available
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mb-8">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-1 bg-green-700 text-white py-4 px-6 rounded-lg font-semibold text-lg
                                             hover:bg-green-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-300
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
                                    className={`p-4 border-2 rounded-lg transition-all hover:scale-110 ${isInWishlist
                                        ? 'border-red-300 bg-red-50 hover:bg-red-100 shadow-sm'
                                        : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                                        }`}
                                    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                >
                                    <HeartIcon inWishlist={isInWishlist} />
                                </button>
                            </div>

                            {/* Product Features */}
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Product Features
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-gray-700">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Eco-friendly and sustainable materials</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-700">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>High quality craftsmanship</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-700">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Free shipping on orders over ₹50</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-700">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>30-day money-back guarantee</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section - Full Width */}
                <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-10">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Customer Reviews
                        </h2>
                        <p className="text-gray-600">Share your experience with this product</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Review Form */}
                        <div className="lg:col-span-1">
                            <ReviewForm
                                productId={product.id}
                                onReviewSubmitted={handleReviewSubmitted}
                            />
                        </div>

                        {/* Review List */}
                        <div className="lg:col-span-2">
                            <ReviewList
                                productId={product.id}
                                refreshKey={reviewUpdateKey}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
