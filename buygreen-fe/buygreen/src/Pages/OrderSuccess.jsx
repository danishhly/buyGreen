import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;

    if (!order) {
        navigate('/cart', { replace: true });
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Success Message Card */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 md:p-12 text-center mb-8">
                    {/* Success Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Order Successful!</h1>
                    <p className="text-lg text-gray-600 mb-2">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                    <p className="text-sm text-gray-500">
                        Order ID: <span className="font-semibold text-green-700">#{order.id}</span>
                    </p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Order Summary
                    </h2>
                    
                    <div className="space-y-4 mb-6">
                        {order.items?.map((item, index) => (
                            <div key={item.id || index} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-gray-900">{item.productName}</p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-lg font-bold text-gray-900">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                    {item.quantity > 1 && (
                                        <p className="text-xs text-gray-500">₹{item.price.toFixed(2)} each</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t-2 border-gray-200">
                        {order.couponCode && order.discountAmount && Number(order.discountAmount) > 0 && (
                            <div className="mb-4 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900 font-semibold">
                                        ₹{(Number(order.totalAmount) + Number(order.discountAmount)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">
                                        Discount ({order.couponCode})
                                    </span>
                                    <span className="text-green-600 font-semibold">
                                        -₹{Number(order.discountAmount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-semibold text-gray-700">Total</span>
                            <span className="text-3xl font-bold text-green-700">
                                ₹{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : parseFloat(order.totalAmount).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to="/CustomerHome"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-green-700 text-white px-8 py-4 rounded-lg hover:bg-green-800 transition-colors font-semibold text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Continue Shopping
                    </Link>
                    <Link
                        to="/orders"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 px-8 py-4 rounded-lg hover:bg-green-50 transition-colors font-semibold text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                        View Orders
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default OrderSuccess;

