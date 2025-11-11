// src/Contexts/CartProvider.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosConfig';
import { CartContext } from './CartContext'; // <-- Import the context

// This file now only has ONE export: the component itself.
export const CartProvider = ({ children }) => {
    // --- CART STATE ---
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- NEW WISHLIST STATE ---
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // Refs for preventing duplicate requests
    const pendingDecrements = useRef(new Set());
    const pendingIncrements = useRef(new Set());

    const getCustomer = () => {
        const storedCustomer = localStorage.getItem('customer');
        if (!storedCustomer) {
            return null;
        }
        try {
            const customer = JSON.parse(storedCustomer);
            return customer;
        } catch (err) {
            console.error("Failed to parse customer from localStorage", err);
            return null;
        }
    };

    // --- CART FUNCTIONS ---
    const fetchCart = useCallback(async () => {
        const customer = getCustomer();
        if (!customer) {
            setCartItems([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.get(`/cart/${customer.id}`);
            setCartItems(res.data);
        } catch (err) {
            console.error("Error fetching cart:", err);
            // Handle 401/403 (Token Expired) later if needed
            setError("Could not load cart.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addToCart = async (product, quantity = 1) => {
        const customer = getCustomer();
        if (!customer) throw new Error("User is not logged in.");

        // Prevent duplicate requests
        const requestKey = `add-${product.id}`;
        if (pendingIncrements.current.has(requestKey)) {
            return; // Request already in progress
        }

        // Optimistic update
        const existingItem = cartItems.find(item => item.productId === product.id);
        if (existingItem) {
            setCartItems(prev => prev.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setCartItems(prev => [...prev, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: quantity
            }]);
        }

        pendingIncrements.current.add(requestKey);

        try {
            const response = await api.post(
                "/cart/add",
                {
                    customerId: customer.id,
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    quantity: quantity
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            if (response.data != "Item added to cart") {
                throw new Error(response.data);
            }
            // Refresh cart to get accurate data
            await fetchCart();
        } catch (err) {
            console.error("Error adding to cart:", err);
            // Revert optimistic update on error
            await fetchCart();
            throw err;
        } finally {
            pendingIncrements.current.delete(requestKey);
        }
    };

    const decrementFromCart = async (productId) => {
        const customer = getCustomer();
        if (!customer) throw new Error("User is not logged in.");

        // Prevent duplicate requests
        const requestKey = `dec-${productId}`;
        if (pendingDecrements.current.has(requestKey)) {
            return; // Request already in progress
        }

        // Optimistic update
        const existingItem = cartItems.find(item => item.productId === productId);
        if (existingItem) {
            if (existingItem.quantity > 1) {
                setCartItems(prev => prev.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                ));
            } else {
                // Remove item if quantity is 1
                setCartItems(prev => prev.filter(item => item.productId !== productId));
            }
        }

        pendingDecrements.current.add(requestKey);

        try {
            const response = await api.put(
                "/cart/decrement",
                {
                    customerId: customer.id,
                    productId
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            // Refresh cart to get accurate data
            await fetchCart();
        } catch (err) {
            console.error("Error decrementing cart item:", err);
            // Revert optimistic update on error
            await fetchCart();

            // Provide more specific error message
            if (err.response?.status === 403) {
                throw new Error("Session expired. Please refresh the page and try again.");
            } else if (err.response?.status === 401) {
                throw new Error("Please login to continue.");
            } else {
                throw err;
            }
        } finally {
            pendingDecrements.current.delete(requestKey);
        }
    };

    // --- NEW WISHLIST FUNCTIONS ---

    const fetchWishlist = useCallback(async () => {
        const customer = getCustomer();
        if (!customer) {
            setWishlistItems([]);
            return;
        }
        setIsWishlistLoading(true);
        try {
            // This endpoint is secured and will use the token from axiosConfig
            const res = await api.get('/wishlist');
            setWishlistItems(res.data);
        } catch (err) {
            console.error("Error fetching wishlist:", err);
        } finally {
            setIsWishlistLoading(false);
        }
    }, []);

    const addToWishlist = async (productId) => {
        if (!getCustomer()) throw new Error("User is not logged in.");
        if (!productId || productId === null || productId === undefined) {
            throw new Error("Product ID is required");
        }
        try {
            const response = await api.post('/wishlist/add', { productId: Number(productId) });
            await fetchWishlist(); // Refresh wishlist
            return response.data;
        } catch (err) {
            console.error("Error adding to wishlist:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to add to wishlist";
            throw new Error(errorMessage);
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!getCustomer()) throw new Error("User is not logged in.");
        if (!productId || productId === null || productId === undefined) {
            throw new Error("Product ID is required");
        }
        try {
            await api.post('/wishlist/remove', { productId: Number(productId) });
            await fetchWishlist(); // Refresh wishlist
        } catch (err) {
            console.error("Error removing from wishlist:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to remove from wishlist";
            throw new Error(errorMessage);
        }
    };

    // --- CHECKOUT/ORDER FUNCTIONS ---

    const createPaymentOrder = async (amount) => {
        const normalizedAmount = Number(amount.toFixed(2));
        const response = await api.post("/payments/order", {
            amount: normalizedAmount,
            currency: "INR",
            receipt: `buygron_${Date.now()}`
        });
        return response.data;
    };

    const placeOrder = async (shippingAddress = null, location = null, addressData = null, couponCode = null, orderItems = null, orderAmount = null) => {
        const customer = getCustomer();
        if (!customer) throw new Error("User is not logged in.");

        // Use provided items and amount, or fall back to cart items
        const itemsToOrder = orderItems || cartItems;
        const totalAmount = orderAmount !== null ? orderAmount : itemsToOrder.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Validate that we have items to order
        if (!itemsToOrder || itemsToOrder.length === 0) {
            throw new Error("No items to order. Cart is empty.");
        }

        // Get shipping address from customer profile if not provided
        let address = shippingAddress;
        if (!address && customer.address) {
            address = customer.address;
        }

        const payload = {
            customerId: Number(customer.id),
            totalAmount: Number(totalAmount.toFixed(2)), // Ensure it's a number with 2 decimal places
            items: itemsToOrder.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: Number(item.price),
                quantity: Number(item.quantity)
            })),
            shippingAddress: address || null,
            location: location || null,
            street: addressData?.street || null,
            city: addressData?.city || null,
            state: addressData?.state || null,
            country: addressData?.country || null,
            pincode: addressData?.pincode || null,
            couponCode: couponCode || null
        };

        console.log("Placing order with payload:", payload);

        try {
            // Increase timeout for order placement
            const response = await api.post("/orders/create", payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000 // 60 seconds for order placement
            });

            console.log("Order placed successfully:", response.data);
            console.log("Order ID:", response.data?.id);

            // Verify order was created successfully
            if (!response.data || (!response.data.id && response.status !== 201 && response.status !== 200)) {
                throw new Error("Order creation failed - invalid response from server");
            }

            // Only clear cart if we used cart items (not provided items)
            // Don't fail the order if cart clearing fails
            if (!orderItems) {
                try {
                    await fetchCart(); // Refresh cart after order
                } catch (cartError) {
                    console.warn("Failed to refresh cart after order, but order was successful:", cartError);
                    // Don't throw - order was successful, cart refresh is not critical
                }
            }

            // Return the order object
            return response.data;
        } catch (err) {
            console.error("Order placement error:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);

            // Provide more specific error messages
            if (!err.response) {
                // Network error
                throw new Error("Network error. Please check your internet connection and try again.");
            }

            if (err.response?.status === 401) {
                throw new Error("Session expired. Please login again.");
            }

            if (err.response?.status === 403) {
                const errorMessage = err.response?.data?.message || "You do not have permission to place orders. Please contact support.";
                throw new Error(errorMessage);
            }

            if (err.response?.status >= 500) {
                throw new Error("Server error. Please try again in a moment.");
            }

            // For other errors, provide more context
            const errorMessage = err.response?.data?.message || err.message || "Failed to place order. Please try again.";
            throw new Error(errorMessage);
        }
    };

    const fetchOrders = async () => {
        const customer = getCustomer();
        if (!customer) throw new Error("User is not logged in.");

        const response = await api.get(`/orders/customer/${customer.id}`);
        return response.data;
    }

    // --- EFFECT TO LOAD DATA ON LOGIN/APP LOAD ---
    useEffect(() => {
        fetchCart();
        fetchWishlist();
    }, [fetchCart, fetchWishlist]);

    // --- CONTEXT VALUE ---
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = wishlistItems.length; // New count

    const value = {
        // Cart
        cartItems,
        cartCount,
        addToCart,
        decrementFromCart,
        fetchCart,
        isLoading,
        error,
        // Orders
        createPaymentOrder,
        placeOrder,
        fetchOrders,
        // NEW Wishlist
        wishlistItems,
        wishlistCount,
        isWishlistLoading,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};