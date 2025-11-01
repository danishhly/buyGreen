import React from 'react';
import { useCart } from '../Hooks/UseCart';
import { Link } from 'react-router-dom'; // Import Link

const CartPage = () => {
    const { cartItems, addToCart, decrementFromCart } = useCart();

    const handleDecrease = async (item) => {
        try {
            await decrementFromCart(item.productId);
        } catch (err) {
            console.error('Failed to decrease quantity', err);
            alert('Could not decrease item quantity. Please try again.');
        }
    };

    const handleIncrease = async (item) => {
        try {
            await addToCart({
                id: item.productId,
                name: item.productName,
                price: item.price
            });
        } catch (err) {
            console.error('Failed to increase quantity', err);
            alert('Could not increase item quantity. Please try again.');
        }
    };

    // Calculate the total price
    const total = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6">🛒 Your Cart</h2>

            {cartItems.length === 0 ? (
                <div>
                    <p>No items yet!</p>
                    <Link to="/" className="text-green-700 hover:underline">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div>
                    {/* List of items */}
                    <div className="space-y-4">
                        {cartItems.map(item => (
                            // Note: If your cart item has its own unique 'id',
                            // use 'item.id' as the key. 'item.productId' is fine
                            // if it's the only unique ID you have.
                            <div key={item.productId} className="flex justify-between items-center border p-4 rounded-lg shadow-sm">
                                <div>
                                    <h4 className="text-lg font-semibold">{item.productName}</h4>
                                    <div className="mt-2 flex items-center gap-3">
                                        <button
                                            onClick={() => handleDecrease(item)}
                                            className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                            aria-label={`Decrease quantity of ${item.productName}`}
                                        >
                                            −
                                        </button>
                                        <span className="text-gray-700">{item.quantity}</span>
                                        <button
                                            onClick={() => handleIncrease(item)}
                                            className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                            aria-label={`Increase quantity of ${item.productName}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Total */}
                    <div className="mt-8 pt-4 border-t">
                        <h3 className="text-2xl font-bold text-right">
                            Total: ${total.toFixed(2)}
                        </h3>
                        <button className="w-full mt-4 bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;