// src/Contexts/CartProvider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { CartContext } from './CartContext'; // <-- Import the context

// This file now only has ONE export: the component itself.
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const parseStoredValue = (value) => {
        if (value === null || value === undefined) return null;
        try {
            return JSON.parse(value);
        } catch (err) {
            return value;
        }
    };

   // --- THIS IS THE FIX ---
    const getCustomer = () => {
        const storedCustomer = localStorage.getItem('customer');
        if (!storedCustomer) {
            return null; // No user found
        }
        try {
            // Parse the full customer object
            const customer = JSON.parse(storedCustomer);
            return customer; // Return the whole object { id, name, email, role }
        } catch (err) {
            console.error("Failed to parse customer from localStorage", err);
            return null;
        }
    };
    

    const fetchCart = useCallback(async () => {
        const customer = getCustomer();
        if (!customer) {
            setCartItems([]);
            return;
        }
        setIsLoading(true);
        try {
           //const token = localStorage.getItem('authToken');
            // I'm assuming your endpoint needs the customer ID
            const res = await api.get(`/cart/${customer.id}`);
           // {  
            //    headers: {  
            //        'Authorization': `Bearer ${token}`  
            //    } 
          //  });
            setCartItems(res.data);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError("Could not load cart.");
        } finally {
            setIsLoading(false);
        }
    }, []);

   const addToCart = async (product, quantity = 1) => {
    const customer = getCustomer();
    if (!customer) throw new Error("User is not logged in.");

    try {
        // ✅ CHECK TOKEN FIRST (before making request)
        //const token = localStorage.getItem('authToken');
        //if (!token) {
       //     throw new Error("User is not logged in. No authentication token found.");
       // }

        // ✅ SEND TOKEN IN HEADERS
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
                headers: {
                    'Content-Type': 'application/json',
              //      'Authorization': `Bearer ${token}` // ✅ Send token here
                }
            }
        );
        if(response.data != "Item added to cart") {
            throw new Error(response.data);
        }

        await fetchCart();
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
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        await fetchCart();
    } catch (err) {
        console.error("Error decrementing cart item:", err);
        throw err;
    }
};

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
            headers: {
                'Content-Type': 'application/json'
            }
        });

        await fetchCart();
        return response.data;
    };

    const fetchOrders = async () => {
        const customer = getCustomer();
        if (!customer) throw new Error("User is not logged in.");

        const response = await api.get(`/orders/customer/${customer.id}`);
        return response.data;
    }

    const value = { cartItems, cartCount, addToCart, decrementFromCart, fetchCart, createPaymentOrder, placeOrder, fetchOrders, isLoading, error };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};