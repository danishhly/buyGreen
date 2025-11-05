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
            alert(err.meassage || 'Could not increase item quantity. Please try again.');
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
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading || isProcessingPayment}
                            className="w-full mt-4 bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isProcessingPayment ? 'Processing...' : 'Proceed to Checkout'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;