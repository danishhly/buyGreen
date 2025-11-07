import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig'; // Use the correct lowercase 'api' path
import { useCart } from '../Hooks/UseCart';
import ImageSlider from '../Component/ImageSlider.jsx'; // Import the slider

// --- LoadingSpinner ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
    </div>
);

// --- Component for Stock Display ---
const StockDisplay = ({ stock }) => {
    if (stock > 10) {
        return <p className="text-green-600 font-semibold">In Stock</p>;
    }
    if (stock > 0) {
        return <p className="text-yellow-600 font-semibold">Only {stock} left!</p>;
    }
    return <p className="text-red-600 font-semibold">Out of Stock</p>;
};

const HeartIcon = ({ inWishlist }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={inWishlist ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2"
        className={`w-6 h-6 transition-colors ${
            inWishlist 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-400 hover:text-red-400'
        }`}
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const[isInWishlist, setIsInWishlist] = useState(false);
    
    const { productId } = useParams();
    const{ addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useCart();

    const navigate = useNavigate();

    useEffect(() => {
        if(product) {
            const inList = wishlistItems.some(item => item.productId === product.id);
            setIsInWishlist(inList);
        }
    },[wishlistItems, product]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
            } catch (err) {
                console.error("Error fetching product:", err);
                navigate('/CustomerHome');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productId, navigate]);

    // --- Handlers for quantity and cart ---
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

    const handleAddToCart = () => {
        try {
            addToCart(product, quantity);
            alert(`${quantity} x ${product.name} added to cart!`);
        } catch (err) {
            console.log("went wrong", err);
            if (err.message && (err.message.includes("Not enough stock") || err.message.includes("User is not logged in"))) {
                alert(err.message);
            } else {
                alert("Failed to add item. Please log in first.");
                navigate('/login');
            }
        }
    };

    const handleWishlistToggle = async () => {
        // Check if user is logged in first
        const storedCustomer = localStorage.getItem('customer');
        if (!storedCustomer) {
            alert("Please log in to add items to your wishlist.");
            navigate("/login");
            return;
        }

        try {
            if(isInWishlist) {
                await removeFromWishlist(product.id);
            } else {
                await addToWishlist(product.id);
            }
        } catch(err) {
            console.error("Wishlist error", err);
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

    if (!product) {
        return <p>Product not found.</p>;
    }

    const isOutOfStock = product.stockQuantity <= 0;

    // This is the array for the slider.
    // Replace these with real URLs when you have them.
    const productImages = [
        product.imageUrl,
        "https://via.placeholder.com/600x600/eeeeee/999999?text=Image+2", // Placeholder 2
        "https://via.placeholder.com/600x600/eeeeee/999999?text=Image+3"  // Placeholder 3
    ];

    return (
        <div className="max-w-4xl mx-auto p-8">
            <Link to="/CustomerHome" className="text-green-700 hover:underline mb-4 block">
                &larr; Back to all products
            </Link>
            
            {/* --- THIS IS THE 2-COLUMN LAYOUT --- */}
            <div className="flex flex-col md:flex-row gap-8">
                
                {/* Column 1: Image Slider */}
                <div className="md:w-1/2 h-96 rounded-lg shadow-lg overflow-hidden">
                    <ImageSlider images={productImages} />
                </div>
                
                {/* Column 2: Product Info & Actions */}
                <div className="md:w-1/2">
                    <p className="text-gray-500 text-sm font-semibold mb-2 uppercase">
                        {product.category}
                    </p>
                    <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                    <p className="text-gray-600 text-lg mb-4">{product.description}</p>
                    
                    <div className="mb-4">
                        <StockDisplay stock={product.stockQuantity} />
                    </div>
                    
                    <p className="price text-green-700 font-bold mb-6 text-4xl">
                        ${product.price.toFixed(2)}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <p className="font-semibold">Quantity:</p>
                        <div className="flex items-center border rounded">
                            <button 
                                onClick={handleDecrease} 
                                className="px-4 py-2 text-lg disabled:opacity-50"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span className="px-4 py-2 text-lg">{quantity}</span>
                            <button 
                                onClick={handleIncrease} 
                                className="px-4 py-2 text-lg disabled:opacity-50"
                                disabled={quantity >= product.stockQuantity}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    {/* Action Buttons: Add to Cart and Wishlist */}
                    <div className="flex items-center gap-3 mb-6">
                        <button 
                            onClick={handleAddToCart}
                            className="flex-1 bg-green-700 text-white py-3 px-6 rounded-md hover:bg-green-800 transition-colors text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isOutOfStock}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button 
                            onClick={handleWishlistToggle}
                            className={`p-3 border-2 rounded-md transition-all ${
                                isInWishlist 
                                    ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                            <HeartIcon inWishlist={isInWishlist} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;