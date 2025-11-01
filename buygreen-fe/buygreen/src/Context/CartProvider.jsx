// src/Contexts/CartProvider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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

    const getCustomer = () => {
        const idRaw = localStorage.getItem('customerId');
        const nameRaw = localStorage.getItem('customerName');

        const id = parseStoredValue(idRaw);
        const name = parseStoredValue(nameRaw);

        if (!id) return null;

        return { id, name };
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
            const res = await axios.get(`http://localhost:8080/cart/${customer.id}`);
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

   const addToCart = async (product) => {
    const customer = getCustomer();
    if (!customer) throw new Error("User is not logged in.");

    try {
        // ✅ CHECK TOKEN FIRST (before making request)
        //const token = localStorage.getItem('authToken');
        //if (!token) {
       //     throw new Error("User is not logged in. No authentication token found.");
       // }

        // ✅ SEND TOKEN IN HEADERS
        await axios.post(
            "http://localhost:8080/cart/add",
            {
                customerId: customer.id,
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1
            },
            {
                headers: {
                    'Content-Type': 'application/json',
              //      'Authorization': `Bearer ${token}` // ✅ Send token here
                }
            }
        );

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
        await axios.put(
            "http://localhost:8080/cart/decrement",
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

    const value = { cartItems, cartCount, addToCart, decrementFromCart, fetchCart, isLoading, error };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};