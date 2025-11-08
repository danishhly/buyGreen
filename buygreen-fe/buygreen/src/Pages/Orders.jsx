import React, { useEffect, useState } from 'react';
import { useCart } from '../Hooks/UseCart';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../Component/Toast';

// Status badge component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
        CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmed' },
        PROCESSING: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Processing' },
        SHIPPED: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Shipped' },
        DELIVERED: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered' },
        CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
            {config.label}
        </span>
    );
};

const Orders = () => {
    const { fetchOrders } = useCart();
    const { success, error: showError } = useToast();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await fetchOrders();
                // Sort orders by date, newest first
                const sortedOrders = [...data].sort((a, b) => {
                    const dateA = new Date(a.orderDate);
                    const dateB = new Date(b.orderDate);
                    return dateB - dateA;
                });
                setOrders(sortedOrders);
            } catch (err) {
                console.error('Failed to load orders', err);
                setError('Could not load orders. Please log in again.');
                showError('Could not load orders. Please log in again.');
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, [fetchOrders, navigate, showError]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-4 text-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Orders</h1>
                    <p className="text-gray-600">Track and manage all your orders</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
                        <Link
                            to="/CustomerHome"
                            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                                                <StatusBadge status={order.status || 'PENDING'} />
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Placed on {new Date(order.orderDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                            <p className="text-2xl font-bold text-green-700">
                                                ₹{Number(order.totalAmount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="p-6">
                                    {/* Tracking Information */}
                                    {order.trackingNumber && (
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900">Tracking Number</p>
                                                    <p className="text-lg font-mono font-bold text-blue-700">{order.trackingNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Coupon/Discount Info */}
                                    {order.couponCode && order.discountAmount && Number(order.discountAmount) > 0 && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-semibold text-green-900">Coupon Applied</p>
                                                    <p className="text-sm text-green-700">
                                                        Code: <span className="font-mono font-bold">{order.couponCode}</span> - 
                                                        Discount: ₹{Number(order.discountAmount).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Shipping Address */}
                                    {order.shippingAddress && (
                                        <div className="mb-6">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</p>
                                            <p className="text-gray-600">{order.shippingAddress}</p>
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-3">Order Items</p>
                                        <div className="space-y-3">
                                            {order.items?.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <Link
                                                            to={`/product/${item.productId}`}
                                                            className="text-gray-900 font-medium hover:text-green-600 transition-colors"
                                                        >
                                                            {item.productName}
                                                        </Link>
                                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            ₹{Number(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            ₹{Number(item.price).toFixed(2)} each
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Orders;
