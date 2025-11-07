// src/Contexts/CartProvider.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
            await fetchCart(); // Refresh cart
        } catch (err) {
            console.error("Error adding to cart:", err);
            throw err;
        }
    };

    const decrementFromCart = async (productId) => {
        const customer = getCustomer();
        if (!customer) throw new Error("User is not logged in.");

        try {
            await api.put(
                "/cart/decrement",
                {
                    customerId: customer.id,
                    productId
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            await fetchCart(); // Refresh cart
        } catch (err) {
            console.error("Error decrementing cart item:", err);
            throw err;
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
        try {
            await api.post('/wishlist/add', { productId });
            await fetchWishlist(); // Refresh wishlist
        } catch (err) {
            console.error("Error adding to wishlist:", err);
            throw err;
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!getCustomer()) throw new Error("User is not logged in.");
        try {
            await api.post('/wishlist/remove', { productId });
            await fetchWishlist(); // Refresh wishlist
        } catch (err) {
            console.error("Error removing from wishlist:", err);
            throw err;
        }
    };

    // --- CHECKOUT/ORDER FUNCTIONS ---

    const createPaymentOrder = async (amount) => {
        const normalizedAmount = Number(amount.toFixed(2));
        const response = await api.post("/payments/order", {
            amount: normalizedAmount,
            currency: "INR",
            receipt: `buygreen_${Date.now()}`
        });
        return response.data;
    };

    const placeOrder = async () => {
        const customer = getCustomer();
        if (!customer) throw new Error("User is not logged in.");

        const total = cartItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const payload = {
            customerId: Number(customer.id),
            totalAmount: total,
            items: cartItems.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity
            }))
        };

        const response = await api.post("/orders/create", payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        await fetchCart(); // Clear cart after order
        return response.data;
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