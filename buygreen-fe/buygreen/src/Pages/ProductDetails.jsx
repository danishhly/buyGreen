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

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    const { productId } = useParams();
    const { addToCart } = useCart();
    const navigate = useNavigate();

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
                    
                    {/* The "Add to Cart" button belongs INSIDE this column */}
                    <button 
                        onClick={handleAddToCart}
                        className="w-full bg-green-700 text-white py-3 px-6 rounded-md hover:bg-green-800 transition-colors text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isOutOfStock}
                    >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;