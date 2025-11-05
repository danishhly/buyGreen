import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../Hooks/UseCart';
import ImageSlider from '../Component/ImageSlider.jsx';

// Re-use your loading spinner
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
    </div>
);

const StockDisplay = ({ stock }) => {
    if(stock > 10) {
        return <p className = "text-green-600 font-semibold">In Stock</p>
    }
    if(stock > 0){
        return <p className="text-yellow-600 font-semibold">Only {stock} left!</p>;
    }
    return <p className="text-red-600 font-semibold">Out of Stock</p>
};

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { productId } = useParams(); // Gets the ':productId' from the URL
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the single product data
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/products/${productId}`);
                setProduct(response.data);
            } catch (err) {
                console.error("Error fetching product:", err);
                // If product not found, redirect back home
                navigate('/CustomerHome');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productId, navigate]);

    const handleIncrease = () => {
        if(quantity < product.stockQuantity) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrease = () => {
        if(quantity > 1) {
            setQuantity(prev => prev  - 1)
        }
    };

    const handleAddToCart = () => {
        try {
            addToCart(product, quantity);
            alert(`${quantity} x ${product.name} ✅ added to cart!`);
        } catch (err) {
            console.log("went wrong", err);
            alert("Failed to add item. Please log in first.");
            navigate('/login');
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!product) {
        return <p>Product not found.</p>;
    }

    const isOutOfStock = product.stockQuantity <= 0;

    const productImages = [
        product.imageUrl,
        product.imageUrl, // You can replace these with different URLs later
        product.imageUrl
    ];

    return (
        <div className="max-w-4xl mx-auto p-8">
            <Link to="/CustomerHome" className="text-green-700 hover:underline mb-4 block">
                &larr; Back to all products
            </Link>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* 3. REPLACE THE OLD <img> TAG */}
                <div className="md:w-1/2 h-96"> {/* We add a fixed height for the slider container */}
                    <ImageSlider images={productImages} />
                </div>
                
                {/* Product Info */}
                <div className="md:w-1/2">
                <p className="text-gray-500 text-sm font-semibold mb-2 uppercase">
                        {product.category}
                    </p>
                    <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                    <p className="text-gray-600 text-lg mb-4">{product.description}</p>
                    {/* 7. Stock Display (Feature 2) */}
                    <div className="mb-4">
                        <StockDisplay stock={product.stockQuantity} />
                    </div>
                    <p className="price text-green-700 font-bold mb-6 text-4xl">
                        ${product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                        <p className="font-semibold">Quantity:</p>
                        <div className="flex items-center border rounded">
                            </div>
                            <button 
                                onClick={handleDecrease} 
                                className="px-4 py-2 text-lg"
                                disabled={quantity <= 1}
                            > - </button>

                            <span className="px-4 py-2 text-lg">{quantity}</span>
                            <button 
                                onClick={handleIncrease} 
                                className="px-4 py-2 text-lg"
                                disabled={quantity >= product.stockQuantity}
                            >
                                +
                            </button>
                            </div>
                            </div>
                    
                    <button 
                        onClick={handleAddToCart}
                        className="w-full bg-green-700 text-white py-3 px-6 rounded-md hover:bg-green-800 transition-colors text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isOutOfStock} // Disable button if out of stock
                    >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;