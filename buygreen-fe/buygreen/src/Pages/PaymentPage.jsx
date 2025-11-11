import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../Hooks/UseCart';
import { useToast } from '../Component/Toast';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { success, error } = useToast();
    const { placeOrder, fetchOrders } = useCart();
    
    // Helper to get customer from localStorage
    const getCustomer = () => {
        const storedCustomer = localStorage.getItem('customer');
        if (!storedCustomer) return null;
        try {
            return JSON.parse(storedCustomer);
        } catch {
            return null;
        }
    };
    
    // Helper to check if order was created by fetching orders
    const checkIfOrderWasCreated = async (expectedAmount) => {
        try {
            const customer = getCustomer();
            if (!customer || !customer.id) {
                console.warn('Cannot check for order: customer not found');
                return null;
            }
            
            console.log('Checking if order was created for amount:', expectedAmount);
            const orders = await fetchOrders();
            
            if (!orders || !Array.isArray(orders) || orders.length === 0) {
                console.log('No orders found for customer');
                return null;
            }
            
            // Sort orders by date (newest first) to get the most recent
            const sortedOrders = [...orders].sort((a, b) => {
                const dateA = new Date(a.orderDate || a.order_date || 0);
                const dateB = new Date(b.orderDate || b.order_date || 0);
                return dateB - dateA; // Newest first
            });
            
            const latestOrder = sortedOrders[0];
            console.log('Latest order found:', latestOrder);
            
            // Check if this order matches our payment (same amount, recent timestamp)
            if (latestOrder && latestOrder.totalAmount) {
                const orderAmount = Number(latestOrder.totalAmount);
                const expected = Number(expectedAmount);
                
                console.log('Comparing amounts - Order:', orderAmount, 'Expected:', expected);
                
                // Check if amounts match (within 0.01 tolerance for rounding)
                if (Math.abs(orderAmount - expected) < 0.01) {
                    // Check if order was created in the last 5 minutes (increased from 2)
                    const orderDate = new Date(latestOrder.orderDate || latestOrder.order_date);
                    const now = new Date();
                    const diffMinutes = (now - orderDate) / (1000 * 60);
                    
                    console.log('Order date:', orderDate, 'Diff minutes:', diffMinutes);
                    
                    if (diffMinutes < 5) {
                        console.log('✅ Found matching order created recently:', latestOrder);
                        return latestOrder;
                    } else {
                        console.log('Order found but too old:', diffMinutes, 'minutes');
                    }
                } else {
                    console.log('Amount mismatch - Order:', orderAmount, 'Expected:', expected, 'Diff:', Math.abs(orderAmount - expected));
                }
            } else {
                console.log('Latest order missing totalAmount:', latestOrder);
            }
            
            return null;
        } catch (err) {
            console.error('Error checking for created order:', err);
            return null;
        }
    };
    
    const [paymentData, setPaymentData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [selectedPaymentApp, setSelectedPaymentApp] = useState(null);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    
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
        if (!data || !data.amount || (!data.location && !data.address)) {
            error('Payment information missing. Redirecting to cart...');
            setTimeout(() => {
                navigate('/cart');
            }, 2000);
            return;
        }
        
        // Validate cart items are present
        if (!data.cartItems || data.cartItems.length === 0) {
            error('Cart items missing. Redirecting to cart...');
            setTimeout(() => {
                navigate('/cart');
            }, 2000);
            return;
        }
        
        console.log("Payment data loaded:", data);
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
        let orderCreated = false;
        let orderId = null;
        let orderTimeout = null;
        
        try {
            // Set processing state to show loading
            setIsProcessingOrder(true);
            
            // Wait a moment to show success message
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('Placing order with payment data:', {
                location: paymentData.location,
                address: paymentData.address,
                cartItems: paymentData.cartItems?.length,
                cartItemsData: paymentData.cartItems,
                amount: paymentData.amount
            });
            
            // Validate cart items structure before placing order
            if (!paymentData.cartItems || !Array.isArray(paymentData.cartItems) || paymentData.cartItems.length === 0) {
                throw new Error("Cart items are missing or invalid. Please go back to cart and try again.");
            }
            
            // Validate each cart item has required fields
            const invalidItems = paymentData.cartItems.filter(item => 
                !item.productId || !item.productName || !item.price || !item.quantity
            );
            if (invalidItems.length > 0) {
                console.error("Invalid cart items:", invalidItems);
                throw new Error("Some cart items are missing required information. Please refresh your cart and try again.");
            }
            
            // Add a safety timeout to prevent infinite loading
            orderTimeout = setTimeout(async () => {
                if (!orderCreated) {
                    console.error('Order placement timeout - checking if order was created...');
                    setIsProcessingOrder(false);
                    
                    // Check if order was actually created despite timeout
                    const createdOrder = await checkIfOrderWasCreated(paymentData.amount);
                    
                    if (createdOrder) {
                        // Order was created! Redirect to success page
                        console.log('✅ Order was created despite timeout. Redirecting to success page...');
                        success('Order placed successfully! Redirecting to confirmation...');
                        setTimeout(() => {
                            navigate('/order-success', { 
                                state: { order: createdOrder },
                                replace: true 
                            });
                        }, 1000);
                    } else {
                        // Order was not created, show error and redirect to cart
                        error('Order placement is taking too long. Please check your orders page to see if the order was placed, or try again.');
                        setTimeout(() => {
                            navigate('/cart');
                        }, 3000);
                    }
                }
            }, 60000); // 60 seconds - reduced from 90 to check sooner 
            
            // Place the order with address data, items, and amount from payment
            let order;
            try {
                order = await placeOrder(
                    null, 
                    paymentData.location, 
                    paymentData.address, 
                    paymentData.couponCode,
                    paymentData.cartItems, // Pass cart items
                    paymentData.amount     // Pass the actual paid amount
                );
            } catch (orderError) {
                // If placeOrder throws, check if it's a timeout or network error
                console.error('placeOrder function error:', orderError);
                
                // Before re-throwing, check if order was actually created
                // Sometimes the order is created but the response fails
                if (orderError.code === 'ECONNABORTED' || orderError.message?.includes('timeout')) {
                    console.log('Timeout occurred, checking if order was created...');
                    const createdOrder = await checkIfOrderWasCreated(paymentData.amount);
                    if (createdOrder) {
                        // Order was created! Don't throw error, use the created order
                        console.log('✅ Order was created despite timeout. Using created order...');
                        order = createdOrder;
                        orderCreated = true;
                    } else {
                        // Re-throw to be caught by outer catch block
                        throw orderError;
                    }
                } else {
                    // For non-timeout errors, still check if order was created
                    console.log('Error occurred, checking if order was created...');
                    const createdOrder = await checkIfOrderWasCreated(paymentData.amount);
                    if (createdOrder) {
                        // Order was created! Don't throw error, use the created order
                        console.log('✅ Order was created despite error. Using created order...');
                        order = createdOrder;
                        orderCreated = true;
                    } else {
                        // Re-throw to be caught by outer catch block
                        throw orderError;
                    }
                }
            }
            
            // Clear timeout if order was placed successfully
            if (orderTimeout) {
                clearTimeout(orderTimeout);
                orderTimeout = null;
            }
            
            console.log('Order placement response:', order);
            console.log('Order response type:', typeof order);
            console.log('Order keys:', order ? Object.keys(order) : 'null');
            
            // Check if order was actually created - be flexible with response format
            // Backend returns Order object directly with 'id' field
            let extractedOrder = null;
            let orderIdValue = null;
            
            // Try multiple ways to extract the order and ID
            if (order) {
                // Case 1: Order is returned directly (most common)
                if (order.id) {
                    extractedOrder = order;
                    orderIdValue = order.id;
                }
                // Case 2: Order is wrapped in 'order' property
                else if (order.order && order.order.id) {
                    extractedOrder = order.order;
                    orderIdValue = order.order.id;
                }
                // Case 3: Order has orderId instead of id
                else if (order.orderId) {
                    extractedOrder = order;
                    orderIdValue = order.orderId;
                }
                // Case 4: Order is an object but structure is unknown - check if it has required fields
                else if (typeof order === 'object' && (order.customerId || order.totalAmount || order.items)) {
                    // Order exists but might not have ID yet (shouldn't happen, but handle gracefully)
                    console.warn('Order response has order data but no ID field:', order);
                    extractedOrder = order;
                    // Try to find ID in any field
                    orderIdValue = order.id || order.orderId || order.order?.id;
                }
            }
            
            // If we found a valid order with ID, proceed with success
            if (extractedOrder && orderIdValue) {
                orderId = orderIdValue;
                orderCreated = true;
                console.log('✅ Order placed successfully with ID:', orderId);
                
                // Clear processing state
                setIsProcessingOrder(false);
                
                // Show success message
                success('Payment successful! Order placed.');
                
                // Force navigation with a small delay to ensure state is set
                setTimeout(() => {
                    navigate('/order-success', { 
                        state: { order: extractedOrder },
                        replace: true 
                    });
                }, 100);
                return; // Exit early if order was successful
            }
            
            // If order object exists but no ID found, still try to proceed if it looks like an order
            if (extractedOrder && !orderIdValue) {
                console.warn('⚠️ Order response exists but no ID found. Order data:', extractedOrder);
                // Check if order has required fields to be considered valid
                if (extractedOrder.customerId || extractedOrder.items || extractedOrder.totalAmount) {
                    console.log('Order has required fields, proceeding with navigation');
                    orderCreated = true;
                    setIsProcessingOrder(false);
                    success('Payment successful! Order placed.');
                    setTimeout(() => {
                        navigate('/order-success', { 
                            state: { order: extractedOrder },
                            replace: true 
                        });
                    }, 100);
                    return;
                }
            }
            
            // If order exists but we can't parse it properly, still try to navigate
            if (order && typeof order === 'object') {
                console.warn('⚠️ Order response exists but structure is unclear. Attempting navigation anyway:', order);
                orderCreated = true;
                setIsProcessingOrder(false);
                success('Payment successful! Order placed.');
                setTimeout(() => {
                    navigate('/order-success', { 
                        state: { order: order },
                        replace: true 
                    });
                }, 100);
                return;
            }
            
            // If we get here, order structure is completely unexpected
            console.error('❌ Order response structure is unexpected:', order);
            console.error('Order does not have recognizable structure');
            // Even if we can't parse it, if we got a response, the order might have been created
            // Check if order was actually created
            setIsProcessingOrder(false);
            error('Response format is unexpected. Checking if your order was placed...');
            
            // Check if order was actually created despite parsing failure
            const createdOrder = await checkIfOrderWasCreated(paymentData.amount);
            
            if (createdOrder) {
                // Order was created! Redirect to success page
                console.log('✅ Order was created despite parsing failure. Redirecting to success page...');
                success('Order placed successfully! Redirecting to confirmation...');
                setTimeout(() => {
                    navigate('/order-success', { 
                        state: { order: createdOrder },
                        replace: true 
                    });
                }, 1000);
            } else {
                // Order was not created, redirect to orders page to check
                error('Order response format is unexpected. Your order may have been placed. Redirecting to orders page to verify...');
                setTimeout(() => {
                    navigate('/orders');
                }, 3000);
            }
            return;
        } catch (err) {
            // Clear timeout on error
            if (orderTimeout) {
                clearTimeout(orderTimeout);
                orderTimeout = null;
            }
            
            console.error('❌ Failed to place order:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack
            });
            
            const errorMessage = err.message || 'Unknown error occurred';
            const errorResponse = err.response?.data;
            
            // Check if order was actually created despite the error
            // Sometimes the order is created but the response parsing fails
            if (errorResponse && (errorResponse.id || errorResponse.orderId || (errorResponse.order && errorResponse.order.id))) {
                console.log('✅ Order was created despite error. Extracting from error response...');
                const errorOrder = errorResponse.order || errorResponse;
                orderCreated = true;
                setIsProcessingOrder(false);
                success('Payment successful! Order placed.');
                setTimeout(() => {
                    navigate('/order-success', { 
                        state: { order: errorOrder },
                        replace: true 
                    });
                }, 100);
                return;
            }
            
            // Also check if the error response contains order data in any format
            if (errorResponse && typeof errorResponse === 'object') {
                // Try to find order data in various possible locations
                const possibleOrder = errorResponse.order || errorResponse.data || errorResponse;
                if (possibleOrder && (possibleOrder.customerId || possibleOrder.items || possibleOrder.totalAmount)) {
                    console.log('✅ Found order data in error response. Extracting...');
                    orderCreated = true;
                    setIsProcessingOrder(false);
                    success('Payment successful! Order placed.');
                    setTimeout(() => {
                        navigate('/order-success', { 
                            state: { order: possibleOrder },
                            replace: true 
                        });
                    }, 100);
                    return;
                }
            }
            
            // Clear processing state on error
            setIsProcessingOrder(false);
            
            // Only show error if order was NOT created
            // If order was created but something else failed, don't show error
            if (!orderCreated) {
                // Check for timeout errors first
                if (err.code === 'ECONNABORTED' || errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
                    setIsProcessingOrder(false);
                    error('Request timed out. Checking if your order was placed...');
                    
                    // Check if order was actually created despite timeout
                    const createdOrder = await checkIfOrderWasCreated(paymentData.amount);
                    
                    if (createdOrder) {
                        // Order was created! Redirect to success page
                        console.log('✅ Order was created despite timeout. Redirecting to success page...');
                        success('Order placed successfully! Redirecting to confirmation...');
                        setTimeout(() => {
                            navigate('/order-success', { 
                                state: { order: createdOrder },
                                replace: true 
                            });
                        }, 1000);
                    } else {
                        // Order was not created, redirect to orders page to check
                        error('Request timed out. Your order may have been placed. Redirecting to orders page...');
                        setTimeout(() => {
                            navigate('/orders');
                        }, 2000);
                    }
                    return;
                }
                
                if (errorMessage.includes('permission') || errorMessage.includes('403')) {
                    error('Payment successful but you do not have permission to place orders. Please contact support with your payment details. Redirecting to cart...');
                    setTimeout(() => {
                        navigate('/cart');
                    }, 3000);
                    return;
                } else if (errorMessage.includes('400') || errorMessage.includes('Invalid')) {
                    error('Payment successful but order data is invalid. Please check your cart and try again. Redirecting to cart...');
                    setTimeout(() => {
                        navigate('/cart');
                    }, 3000);
                    return;
                } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
                    setIsProcessingOrder(false);
                    error('Network error occurred. Checking if your order was placed...');
                    
                    // Check if order was actually created despite network error
                    const createdOrder = await checkIfOrderWasCreated(paymentData.amount);
                    
                    if (createdOrder) {
                        // Order was created! Redirect to success page
                        console.log('✅ Order was created despite network error. Redirecting to success page...');
                        success('Order placed successfully! Redirecting to confirmation...');
                        setTimeout(() => {
                            navigate('/order-success', { 
                                state: { order: createdOrder },
                                replace: true 
                            });
                        }, 1000);
                    } else {
                        // Order was not created, redirect to orders page to check
                        error('Network error occurred. Your order may have been placed. Redirecting to orders page to check...');
                        setTimeout(() => {
                            navigate('/orders');
                        }, 2000);
                    }
                    return;
                } else if (errorMessage.includes('response format is unexpected')) {
                    setIsProcessingOrder(false);
                    error('Response format issue. Checking if your order was placed...');
                    
                    // Check if order was actually created despite response format issue
                    const createdOrder = await checkIfOrderWasCreated(paymentData.amount);
                    
                    if (createdOrder) {
                        // Order was created! Redirect to success page
                        console.log('✅ Order was created despite response format issue. Redirecting to success page...');
                        success('Order placed successfully! Redirecting to confirmation...');
                        setTimeout(() => {
                            navigate('/order-success', { 
                                state: { order: createdOrder },
                                replace: true 
                            });
                        }, 1000);
                    } else {
                        // Order was not created, redirect to orders page to check
                        error('Response format issue. Your order may have been placed. Redirecting to orders page to confirm...');
                        setTimeout(() => {
                            navigate('/orders');
                        }, 2000);
                    }
                    return;
                } else {
                    setIsProcessingOrder(false);
                    error('An error occurred. Checking if your order was placed...');
                    
                    // Check if order was actually created despite error
                    const createdOrder = await checkIfOrderWasCreated(paymentData.amount);
                    
                    if (createdOrder) {
                        // Order was created! Redirect to success page
                        console.log('✅ Order was created despite error. Redirecting to success page...');
                        success('Order placed successfully! Redirecting to confirmation...');
                        setTimeout(() => {
                            navigate('/order-success', { 
                                state: { order: createdOrder },
                                replace: true 
                            });
                        }, 1000);
                    } else {
                        // Order was not created, redirect to orders page to check
                        error(`An error occurred. Your order may have been placed. Redirecting to orders page to verify...`);
                        setTimeout(() => {
                            navigate('/orders');
                        }, 2000);
                    }
                    return;
                }
            } else {
                // Order was created successfully, but something else failed
                // Don't show error, just log it
                console.warn('Order created successfully but post-order operation failed:', err);
            }
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel the payment?')) {
            error('Payment cancelled. Returning to cart...');
            setTimeout(() => {
                navigate('/cart');
            }, 1000);
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
                        {isProcessingOrder ? (
                            <>
                                <p className="text-gray-600 mb-6">Placing your order...</p>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
                            </>
                        ) : (
                            <p className="text-gray-600 mb-6">Redirecting to order confirmation...</p>
                        )}
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

