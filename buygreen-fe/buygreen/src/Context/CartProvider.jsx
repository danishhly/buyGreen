// src/Contexts/CartProvider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CartContext } from './CartContext'; // <-- Import the context

// This file now only has ONE export: the component itself.
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCustomer = () => {
        const storedCustomer = localStorage.getItem('customer');
        return storedCustomer ? JSON.parse(storedCustomer) : null;
    };

    const fetchCart = useCallback(async () => {
        const customer = getCustomer();
        if (!customer) {
            setCartItems([]);
            return;
        }
        setIsLoading(true);
        try {
            // I'm assuming your endpoint needs the customer ID
            const res = await axios.get(`http://localhost:8080/cart/get/${customer.id}`);
            setCartItems(res.data);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError("Could not load cart.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addToCart = async (product) => {
        const customer = getCustomer();
        if (!customer) throw new Error("User is not logged in.");

        try {
            await axios.post("http://localhost:8080/cart/add", {
                customerId: customer.id,
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1
            });
            await fetchCart();
        } catch (err) {
            console.error("Error adding to cart:", err);
            throw err;
        }
    };

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const value = { cartItems, cartCount, addToCart, fetchCart, isLoading, error };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};