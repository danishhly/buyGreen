import React, { useEffect, useState } from 'react';
import { useCart } from '../Hooks/UseCart';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../Component/Toast';

const CartPage = () => {
    const { success, error, warning } = useToast();
    const { cartItems, addToCart, decrementFromCart, createPaymentOrder, placeOrder, isLoading } = useCart();
    const navigate = useNavigate();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const handleDecrease = async (item) => {
        try {
            await decrementFromCart(item.productId);
        } catch (err) {
            console.error('Failed to decrease quantity', err);
            error('Could not decrease item quantity. Please try again.');
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
            error(err?.message || 'Could not increase item quantity. Please try again.');
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
            warning('Add items to cart before checking out.');
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
                name: 'buygron.',
                description: 'Order Payment',
                order_id: paymentOrder.id,
                handler: async () => {
                    try {
                        const order = await placeOrder();
                        navigate('/order-success', { state: { order } });
                    } catch (err) {
                        console.error('Failed to create order after payment', err);
                        error('Something went wrong finalizing your order.');
                    }
                },
                theme: {
                    color: '#15803d'
                }
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.on('payment.failed', (response) => {
                console.error('Payment failed', response);
                error('Payment failed. Please try again.');
            });

            razorpayInstance.open();
        } catch (err) {
            console.error('Checkout failed', err);
            error('Checkout failed. Please try again.');
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
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Page Title */}
                <div className="mb-8 lg:mb-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        Your Shopping Cart
                    </h1>
                    {cartItems.length > 0 && (
                        <p className="text-gray-600 text-sm md:text-base">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 lg:p-16 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">Start adding items to your cart to continue shopping.</p>
                        <Link 
                            to="/CustomerHome" 
                            className="inline-flex items-center gap-2 px-8 py-4 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 hover:shadow-lg transition-all duration-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* List of items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(item => (
                                <div 
                                    key={item.productId} 
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        {/* Product Name and Quantity Controls */}
                                        <div className="flex-1">
                                            <Link to={`/product/${item.productId}`}>
                                                <h4 className="text-xl font-bold text-gray-900 mb-4 hover:text-green-700 transition-colors">
                                                    {item.productName}
                                                </h4>
                                            </Link>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleDecrease(item)}
                                                    disabled={isLoading}
                                                    className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-green-700 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                                                    aria-label={`Decrease quantity of ${item.productName}`}
                                                >
                                                    −
                                                </button>
                                                <span className="text-lg font-bold text-gray-900 min-w-[3rem] text-center bg-gray-50 py-2 rounded-lg">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleIncrease(item)}
                                                    disabled={isLoading}
                                                    className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-green-700 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                                                    aria-label={`Increase quantity of ${item.productName}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Price */}
                                        <div className="text-right sm:text-left sm:min-w-[120px]">
                                            <p className="text-2xl font-bold text-gray-900 mb-1">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                            {item.quantity > 1 && (
                                                <p className="text-sm text-gray-500">
                                                    ₹{item.price.toFixed(2)} each
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Total and Checkout */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Summary</h3>
                                <div className="border-b border-gray-200 pb-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900 font-semibold">₹{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="text-green-600 font-semibold">Free</span>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-900">Total</span>
                                        <span className="text-3xl font-bold text-green-700">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isLoading || isProcessingPayment}
                                    className="w-full bg-green-700 text-white py-4 px-6 rounded-lg hover:bg-green-800 hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
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
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Proceed to Checkout
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Secure checkout with Razorpay
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CartPage;