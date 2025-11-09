import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../Hooks/UseCart';
import { useToast } from '../Component/Toast';
import api from '../api/axiosConfig';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { success, error } = useToast();
    const { placeOrder } = useCart();
    
    const [paymentData, setPaymentData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [selectedPaymentApp, setSelectedPaymentApp] = useState(null);
    
    // UPI IDs and payment apps
    const upiIds = [
        { id: 'upi1', upi: 'buygreen@paytm', name: 'Paytm' },
        { id: 'upi2', upi: 'buygreen@ybl', name: 'PhonePe' },
        { id: 'upi3', upi: 'buygreen@okaxis', name: 'Google Pay' },
        { id: 'upi4', upi: 'buygreen@paytm', name: 'BHIM UPI' }
    ];
    
    const paymentApps = [
        { id: 'paytm', name: 'Paytm', icon: '💳', color: 'bg-blue-500' },
        { id: 'phonepe', name: 'PhonePe', icon: '📱', color: 'bg-purple-500' },
        { id: 'gpay', name: 'Google Pay', icon: '💰', color: 'bg-green-500' },
        { id: 'bhim', name: 'BHIM UPI', icon: '🏦', color: 'bg-indigo-500' }
    ];

    useEffect(() => {
        // Get payment data from location state
        const data = location.state;
        if (!data || !data.amount || !data.location) {
            error('Payment information missing. Redirecting to cart...');
            setTimeout(() => navigate('/cart'), 2000);
            return;
        }
        setPaymentData(data);
    }, [location, navigate, error]);

    const handleScanQR = () => {
        setIsScanning(true);
        setScanProgress(0);
        
        // Simulate scanning progress
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScanning(false);
                    setPaymentSuccess(true);
                    handlePaymentSuccess();
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const handlePaymentAppClick = (app) => {
        setSelectedPaymentApp(app);
        setIsScanning(true);
        setScanProgress(0);
        
        // Simulate payment processing
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScanning(false);
                    setPaymentSuccess(true);
                    handlePaymentSuccess();
                    return 100;
                }
                return prev + 5;
            });
        }, 150);
    };

    const handlePaymentSuccess = async () => {
        try {
            // Wait a moment to show success message
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Place the order
            const order = await placeOrder(null, paymentData.location, paymentData.couponCode);
            success('Payment successful! Order placed.');
            
            // Navigate to order success page
            setTimeout(() => {
                navigate('/order-success', { state: { order } });
            }, 1000);
        } catch (err) {
            console.error('Failed to place order:', err);
            error('Payment successful but failed to place order. Please contact support.');
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel the payment?')) {
            navigate('/cart');
        }
    };

    if (!paymentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
                        <button
                            onClick={handleCancel}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Amount to Pay</span>
                            <span className="text-3xl font-bold text-green-700">₹{paymentData.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {paymentSuccess ? (
                    /* Payment Success */
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
                        <p className="text-gray-600 mb-6">Your order is being processed...</p>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                    </div>
                ) : isScanning ? (
                    /* Scanning Animation */
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="mb-8">
                            <div className="relative w-64 h-64 mx-auto mb-6">
                                {/* QR Code Placeholder */}
                                <div className="w-full h-full border-4 border-green-500 rounded-lg flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">📱</div>
                                        <div className="text-sm text-gray-600">QR Code</div>
                                    </div>
                                </div>
                                
                                {/* Scanning Lines Animation */}
                                <div 
                                    className="absolute inset-0 border-t-2 border-green-500 animate-pulse"
                                    style={{ 
                                        top: `${scanProgress}%`,
                                        transition: 'top 0.2s ease-out'
                                    }}
                                ></div>
                            </div>
                            
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                    <div 
                                        className="bg-green-600 h-3 rounded-full transition-all duration-200"
                                        style={{ width: `${scanProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-gray-600">
                                    {scanProgress < 100 ? 'Scanning QR Code...' : 'Payment Processing...'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Payment Options */
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* QR Code Scanner Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m0 0H8m0 0V8m0 4v4m0-4h.01M12 12h.01M20 8v4m0 4v.01" />
                                </svg>
                                Scan QR Code
                            </h2>
                            
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📱</div>
                                    <div className="text-sm text-gray-600 mb-2">QR Code</div>
                                    <div className="text-xs text-gray-500">Amount: ₹{paymentData.amount.toFixed(2)}</div>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleScanQR}
                                className="w-full bg-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m0 0H8m0 0V8m0 4v4m0-4h.01M12 12h.01M20 8v4m0 4v.01" />
                                </svg>
                                Scan QR Code
                            </button>
                            
                            {/* UPI IDs */}
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Available UPI IDs</h3>
                                <div className="space-y-2">
                                    {upiIds.map((upi) => (
                                        <div key={upi.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{upi.name}</div>
                                                <div className="text-xs text-gray-600 font-mono">{upi.upi}</div>
                                            </div>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(upi.upi)}
                                                className="text-green-700 hover:text-green-800"
                                                title="Copy UPI ID"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Payment Apps Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Pay with UPI Apps
                            </h2>
                            
                            <div className="space-y-3 mb-6">
                                {paymentApps.map((app) => (
                                    <button
                                        key={app.id}
                                        onClick={() => handlePaymentAppClick(app)}
                                        disabled={selectedPaymentApp !== null}
                                        className={`w-full ${app.color} text-white py-4 px-6 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{app.icon}</span>
                                            <span>{app.name}</span>
                                        </div>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">Payment Information</h3>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    <li>• Secure payment gateway</li>
                                    <li>• Instant payment confirmation</li>
                                    <li>• Order will be placed automatically</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;

