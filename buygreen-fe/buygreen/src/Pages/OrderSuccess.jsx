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
        <div className="max-w-2xl mx-auto p-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <div className="text-4xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold text-green-700 mb-2">Order Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your purchase. Your order ID is
                    <span className="font-semibold text-green-700"> #{order.id}</span>.
                </p>

                <div className="text-left bg-white rounded-md shadow-sm p-6 border border-green-100">
                    <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
                    <ul className="space-y-2">
                        {order.items?.map((item) => (
                            <li key={item.id} className="flex justify-between text-gray-700">
                                <span>{item.productName} × {item.quantity}</span>
                                <span>${item.price}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4 pt-4 border-t flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${order.totalAmount}</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-4">
                    <Link
                        to="/CustomerHome"
                        className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        to="/orders"
                        className="border border-green-700 text-green-700 px-6 py-2 rounded-md hover:bg-green-50 transition-colors"
                    >
                        View Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;

