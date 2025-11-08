import React from 'react';
import { useCart } from '../Hooks/UseCart'; // We'll add wishlist functions to this hook
import { Link } from 'react-router-dom';
import { useToast } from '../Component/Toast';

// A simple X icon for removing items
const RemoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WishlistPage = () => {
    // We will add these to useCart in the next step
    const { success, error } = useToast();
    const { wishlistItems, removeFromWishlist, isWishlistLoading } = useCart();

    const handleRemove = async (productId) => {
        try {
            await removeFromWishlist(productId);
            success("Item removed from wishlist");
        } catch (err) {
            console.error("Failed to remove from wishlist", err);
            error("Could not remove item. Please try again.");
        }
    };

    if (isWishlistLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold text-green-700 mb-6">Your Wishlist</h1>

            {wishlistItems.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-lg shadow-sm">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-6">
                        Click the heart icon on products to save them for later.
                    </p>
                    <Link
                        to="/CustomerHome"
                        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Find Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 relative">
                            {/* Remove Button */}
                            <button
                                onClick={() => handleRemove(item.productId)}
                                className="absolute top-2 right-2 p-1.5 bg-white/70 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all"
                                title="Remove from wishlist"
                            >
                                <RemoveIcon />
                            </button>
                            
                            <Link to={`/product/${item.productId}`}>
                                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                                    {(() => {
                                        // Handle old format where imageUrl might be a string representation of a list
                                        let imageUrl = item.productImageUrl || '';
                                        if (imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
                                            // Try to extract the first URL from list format
                                            try {
                                                const urls = JSON.parse(imageUrl);
                                                imageUrl = Array.isArray(urls) && urls.length > 0 ? urls[0] : '';
                                            } catch (e) {
                                                // If parsing fails, try to extract URL manually
                                                const match = imageUrl.match(/https?:\/\/[^\s,\]]+/);
                                                imageUrl = match ? match[0] : '';
                                            }
                                        }
                                        return (
                                            <img 
                                                src={imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='} 
                                                alt={item.productName} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                                }}
                                            />
                                        );
                                    })()}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {item.productName}
                                    </h3>
                                    <p className="text-xl font-bold text-gray-900">
                                        ₹{item.price.toFixed(2)}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;