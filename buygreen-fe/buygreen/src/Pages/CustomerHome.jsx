import React, { useEffect, useState } from 'react';
// 1. Import useLocation
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from "axios";
import { useCart } from '../Hooks/UseCart';

// ... (LoadingSpinner component) ...
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
    </div>
);

const CustomerHome = () => {
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();

    // 2. Get the location
    const location = useLocation();
    const { addToCart } = useCart();

    // 3. This useEffect will now re-run when you navigate back from the login page
    useEffect(() => {
        // Fetch products
        axios.get("http://localhost:8080/products/all")
            .then((res) => setProducts(res.data))
            .catch((err) => console.error("Error fetching products:", err))
            .finally(() => setIsLoadingProducts(false));

        const parseStoredValue = (value) => {
            if (value === null || value === undefined) return null;
            try {
                return JSON.parse(value);
            } catch (err) {
                return value;
            }
        };

        // Check for customer
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            try {
                const parsedCustomer = JSON.parse(storedCustomer);
                setCustomer(parsedCustomer);
                return;
            } catch (err) {
                console.error('Failed to parse stored customer', err);
            }
        }

        const customerName = parseStoredValue(localStorage.getItem('customerName'));
        const userRole = parseStoredValue(localStorage.getItem('Role'));
        if (customerName && userRole) {
            setCustomer({
                name: customerName,
                role: userRole
            });
        }
    }, [location]); // 4. Add 'location' as a dependency

    const handleAddToCart = async (product) => {
        // 5. This check will now correctly find the customer
        if (!customer) {
            alert("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }

        try {
            await addToCart(product);
            alert(`${product.name} ✅ added to cart!`);
        } catch (err) {
            console.log("went wrong", err)
            alert("Failed to add item to cart. Please try again.");
        }
    };

    // This component no longer needs its own <header> or handleLogout function,
    // as that is handled by the global Navbar.

    return (
        <main className="p-8">
            {isLoadingProducts ? (
                <LoadingSpinner />
            ) : (
                <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((p) => (
                        <Link 
                        to={`/product/${p.id}`} 
                            key={p.id} 
                            className="product-card block border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                        >
                       
                            <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{p.name}</h3>
                                <p className="desc text-gray-600 mt-1 text-sm">{p.description}</p>
                                <p className="price text-green-700 font-bold mt-2 text-xl">${p.price.toFixed(2)}</p>

                                <button onClick={(e) => {
                                    e.preventDefault();
                                    handleAddToCart(p);
                                }}

                               className="w-full mt-4 bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors">
                                    Add to Cart
                                </button>
                            </div>
                            </Link>
                        
                    ))}
                </div>
            )}
        </main>
    );
};

export default CustomerHome;