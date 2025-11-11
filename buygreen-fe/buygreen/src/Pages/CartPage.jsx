import React, { useEffect, useState } from 'react';
import { useCart } from '../Hooks/UseCart';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../Component/Toast';
import api from '../api/axiosConfig';

const CartPage = () => {
    const { success, error, warning } = useToast();
    const { cartItems, addToCart, decrementFromCart, createPaymentOrder, placeOrder, isLoading } = useCart();
    const navigate = useNavigate();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        country: 'India',
        pincode: ''
    });
    const [showLocationModal, setShowLocationModal] = useState(false);

    const handleDecrease = async (item) => {
        try {
            await decrementFromCart(item.productId);
        } catch (err) {
            console.error('Failed to decrease quantity', err);
            // Show more specific error message
            const errorMessage = err.message || 'Could not decrease item quantity. Please try again.';
            if (errorMessage.includes('Session expired') || errorMessage.includes('login')) {
                error(errorMessage);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                error(errorMessage);
            }
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

    // Razorpay script removed - we're using mock payment system
    // Uncomment below if you need Razorpay in the future
    // useEffect(() => {
    //     if (!window.Razorpay) {
    //         const script = document.createElement('script');
    //         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    //         script.async = true;
    //         document.body.appendChild(script);
    //     }
    // }, []);

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            warning('Add items to cart before checking out.');
            return;
        }

        // Show location modal if address is not complete
        if (!address.street || !address.city || !address.state || !address.pincode) {
            setShowLocationModal(true);
            return;
        }

        // Calculate total amount
        const totalAmount = subtotal - discount;
        
        // Ensure cart items have all required fields before navigating
        const validatedCartItems = cartItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            price: Number(item.price),
            quantity: Number(item.quantity)
        }));
        
        // Navigate to payment page with payment data
        navigate('/payment', {
            state: {
                amount: totalAmount,
                location: location.trim() || `${address.city}, ${address.state}`,
                address: address,
                couponCode: appliedCoupon?.code || null,
                cartItems: validatedCartItems // Pass validated cart items for order creation
            }
        });
    };

    const handleAddressChange = (field, value) => {
        setAddress(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLocationSubmit = () => {
        // Validate required fields
        if (!address.street || !address.street.trim()) {
            warning('Please enter your street address');
            return;
        }
        if (!address.city || !address.city.trim()) {
            warning('Please enter your city');
            return;
        }
        if (!address.state || !address.state.trim()) {
            warning('Please enter your state');
            return;
        }
        if (!address.pincode || !address.pincode.trim()) {
            warning('Please enter your pincode');
            return;
        }
        if (!address.country || !address.country.trim()) {
            warning('Please enter your country');
            return;
        }

        // Set location as city, state if not provided
        if (!location || location.trim() === '') {
            setLocation(`${address.city}, ${address.state}`);
        }

        setShowLocationModal(false);
        
        // Ensure cart items have all required fields before navigating
        const validatedCartItems = cartItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            price: Number(item.price),
            quantity: Number(item.quantity)
        }));
        
        // Calculate total amount and navigate to payment page
        const totalAmount = subtotal - discount;
        navigate('/payment', {
            state: {
                amount: totalAmount,
                location: location.trim() || `${address.city}, ${address.state}`,
                address: address,
                couponCode: appliedCoupon?.code || null,
                cartItems: validatedCartItems // Pass validated cart items for order creation
            }
        });
    };

    // Calculate the total price
    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    const total = subtotal - discount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            warning('Please enter a coupon code');
            return;
        }

        setIsValidatingCoupon(true);
        try {
            const response = await api.post('/coupons/validate', {
                code: couponCode.trim().toUpperCase(),
                orderTotal: subtotal
            });

            if (response.data.valid) {
                setAppliedCoupon(response.data.coupon);
                setDiscount(Number(response.data.discount));
                success(`Coupon "${couponCode.toUpperCase()}" applied! You saved ₹${Number(response.data.discount).toFixed(2)}`);
            } else {
                error(response.data.message || 'Invalid coupon code');
                setAppliedCoupon(null);
                setDiscount(0);
            }
        } catch (err) {
            console.error('Error validating coupon:', err);
            error(err.response?.data?.message || 'Failed to validate coupon. Please try again.');
            setAppliedCoupon(null);
            setDiscount(0);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setAppliedCoupon(null);
        setDiscount(0);
        success('Coupon removed');
    };

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
                                
                                {/* Coupon Code Section */}
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    {!appliedCoupon ? (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Have a coupon code?</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    placeholder="Enter code"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleApplyCoupon();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidatingCoupon || !couponCode.trim()}
                                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                                >
                                                    {isValidatingCoupon ? (
                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        'Apply'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-semibold text-green-800">{appliedCoupon.code}</p>
                                                    <p className="text-xs text-green-600">₹{discount.toFixed(2)} discount applied</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="text-red-600 hover:text-red-700 transition-colors"
                                                title="Remove coupon"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="border-b border-gray-200 pb-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900 font-semibold">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">Discount</span>
                                            <span className="text-green-600 font-semibold">-₹{discount.toFixed(2)}</span>
                                        </div>
                                    )}
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
                                    Secure checkout
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            {/* Address Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Delivery Address</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Please provide your complete address for order delivery.
                        </p>
                        
                        <div className="space-y-4">
                            {/* Street Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Street Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={address.street}
                                    onChange={(e) => handleAddressChange('street', e.target.value)}
                                    placeholder="House/Flat No., Building Name, Street"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            {/* City and State Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        placeholder="City"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                        placeholder="State"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Country and Pincode Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.country}
                                        onChange={(e) => handleAddressChange('country', e.target.value)}
                                        placeholder="Country"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.pincode}
                                        onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/\D/g, ''))}
                                        placeholder="Pincode"
                                        maxLength="6"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Location (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., Near Metro Station, Landmark"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowLocationModal(false);
                                    setAddress({
                                        street: '',
                                        city: '',
                                        state: '',
                                        country: 'India',
                                        pincode: ''
                                    });
                                    setLocation('');
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLocationSubmit}
                                className="flex-1 px-4 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </main>
        </div>
    );
};

export default CartPage;