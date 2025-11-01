import React, { useEffect, useState } from 'react';
import { useCart } from '../Hooks/UseCart';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
    const { fetchOrders } = useCart();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await fetchOrders();
                setOrders(data);
            } catch (err) {
                console.error('Failed to load orders', err);
                setError('Could not load orders. Please log in again.');
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, [fetchOrders, navigate]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
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
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-green-700 mb-6">Your Orders</h1>

            {orders.length === 0 ? (
                <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                                    <p className="text-gray-500 text-sm">
                                        Placed on {new Date(order.orderDate).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-lg font-semibold text-green-700">
                                    ${Number(order.totalAmount).toFixed(2)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex justify-between text-gray-700">
                                        <span>
                                            {item.productName} × {item.quantity}
                                        </span>
                                        <span>${Number(item.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;

