// CustomerHome.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useCart } from '../Hooks/useCart'; 

// A simple, self-contained spinner component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
    </div>
);

const CustomerHome = () => {
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [customer, setCustomer] = useState(null); // <-- Renamed for clarity
    const navigate = useNavigate();

    // Get the addToCart function from our context
    const { addToCart } = useCart();

    useEffect(() => {
        // --- Fetch Products (This logic is fine here) ---
        axios.get("http://localhost:8080/products/all")
            .then((res) => {
                setProducts(res.data);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
            })
            .finally(() => {
                setIsLoadingProducts(false);
            });

        // Get the logged-in user from localStorage
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            setCustomer(JSON.parse(storedCustomer));
        }
    }, []);

    // --- SIMPLIFIED: This function now uses the context ---
    const handleAddToCart = async (product) => {
        if (!customer) {
            alert("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }

        try {
            await addToCart(product);
            alert(`${product.name} ✅ added to cart!`);
        } catch (error) {
          console.error("Error adding to cart", error);
            alert("Failed to add item to cart. Please try again.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer');
        setCustomer(null);
        // Note: You might want to clear the cart in the context as well
        navigate('/login');
    };

    return (
        <div className="customer-home">
            <header className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                         {/* ... Your header SVG and Nav ... */}
                         <nav aria-label="Global">
                            <ul className="flex items-center gap-6 text-sm">
                                <li><a className="text-gray-500 transition hover:text-gray-500/75" href="#">Home</a></li>
                                <li><a className="text-gray-500 transition hover:text-gray-500/75" href="#">Cart</a></li>
                                {/* BUG FIX: Display customer.name, not the whole object */}
                                <li>
                                    <a className="text-gray-500 transition hover:text-gray-500/75" href="#">
                                        {customer ? `Hi, ${customer.name}` : 'Profile'}
                                    </a>
                                </li>
                            </ul>
                        </nav>
                         {/* ... Rest of your header ... */}
                    </div>
                    
              <div className="flex items-center gap-4">
              <div className="sm:flex sm:gap-4">
                {/* 4. Use a button with an onClick for the logout action */}
                <button 
                  onClick={handleLogout} 
                  className="rounded-md bg-green-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm"
                >
                  Logout
                </button>
              </div>
              <div className="block md:hidden">{/* ... mobile menu button ... */}</div>
            </div>
          </div>
      </header>

            <main className="p-8">
                {isLoadingProducts ? (
                    <LoadingSpinner />
                ) : (
                    <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <div key={p.id} className="product-card border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{p.name}</h3>
                                    <p className="desc text-gray-600 mt-1 text-sm">{p.description}</p>
                                    <p className="price text-green-700 font-bold mt-2 text-xl">{p.price}</p>
                                    <button onClick={() => handleAddToCart(p)} className="w-full mt-4 bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerHome;