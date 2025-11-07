import React, { useEffect, useState } from 'react';
import { useCart } from '../Hooks/UseCart';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { cartItems, addToCart, decrementFromCart, createPaymentOrder, placeOrder, isLoading } = useCart();
    const navigate = useNavigate();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
            alert(err?.message || 'Could not increase item quantity. Please try again.');
        }
    };

    useEffect(() => {
        if (!window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert('Add items to cart before checking out.');
            return;
        }

        try {
            setIsProcessingPayment(true);

            const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const paymentOrder = await createPaymentOrder(totalAmount);

            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
            const canUseRazorpay = Boolean(razorpayKey) && window.Razorpay && !paymentOrder.mock;

            if (!canUseRazorpay) {
                const order = await placeOrder();
                navigate('/order-success', { state: { order } });
                return;
            }
            const options = {
                key: razorpayKey,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency,
                name: 'BuyGreen',
                description: 'Order Payment',
                order_id: paymentOrder.id,
                handler: async () => {
                    try {
                        const order = await placeOrder();
                        navigate('/order-success', { state: { order } });
                    } catch (err) {
                        console.error('Failed to create order after payment', err);
                        alert('Something went wrong finalizing your order.');
                    }
                },
                theme: {
                    color: '#15803d'
                }
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.on('payment.failed', (response) => {
                console.error('Payment failed', response);
                alert('Payment failed. Please try again.');
            });

            razorpayInstance.open();
        } catch (err) {
            console.error('Checkout failed', err);
            alert('Checkout failed. Please try again.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Calculate the total price
    const total = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        Your Cart
                    </h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-600 mb-6">Start adding items to your cart to continue shopping.</p>
                        <Link 
                            to="/CustomerHome" 
                            className="inline-flex items-center px-6 py-3 bg-green-700 text-white font-semibold rounded-md hover:bg-green-800 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* List of items */}
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div 
                                    key={item.productId} 
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        {/* Product Name and Quantity Controls */}
                                        <div className="flex-1">
                                            <h4 className="text-xl font-semibold text-gray-900 mb-4">
                                                {item.productName}
                                            </h4>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleDecrease(item)}
                                                    disabled={isLoading}
                                                    className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-green-700 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                                                    aria-label={`Decrease quantity of ${item.productName}`}
                                                >
                                                    −
                                                </button>
                                                <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleIncrease(item)}
                                                    disabled={isLoading}
                                                    className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 hover:border-green-700 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                                                    aria-label={`Increase quantity of ${item.productName}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Price */}
                                        <div className="text-right ml-6">
                                            <p className="text-2xl font-bold text-gray-900">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                            {item.quantity > 1 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    ${item.price.toFixed(2)} each
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Total and Checkout */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <div className="border-b border-gray-200 pb-4 mb-6">
                                <div className="flex justify-end">
                                    <h3 className="text-3xl font-bold text-gray-900">
                                        Total: ${total.toFixed(2)}
                                    </h3>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isLoading || isProcessingPayment}
                                className="w-full bg-green-700 text-white py-4 px-6 rounded-md hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
                            >
                                {isProcessingPayment ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Proceed to Checkout'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CartPage;