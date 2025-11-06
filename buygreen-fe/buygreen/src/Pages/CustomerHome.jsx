import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../Api/axiosConfig';
import { useCart } from '../Hooks/UseCart';

// --- LoadingSpinner (no changes) ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
    </div>
);

const CustomerHome = () => {
    // --- 1. STATE CHANGES ---
    // State for all products from the API 
    const [allProducts, setAllProducts] = useState([]);
    // State for the products we actually display (the "filtered list")
    const [filteredProducts, setFilteredProducts] = useState([]); 
    
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();

    // State for our new filter inputs
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]); // To hold the list of unique categories

    // --- 2. DATA FETCHING (MODIFIED) ---
    // This effect runs only ONCE to get all data
    useEffect(() => {
        api.get("/products/all")
            .then((res) => {
                const products = res.data;
                // Set both the master list and the displayed list
                setAllProducts(products);
                setFilteredProducts(products);
                
                // --- Automatically find all unique categories ---
                // We use a Set to ensure each category name is unique
                const uniqueCategories = [
                    ...new Set(products.map(p => p.category.trim()))
                ];
                setCategories(uniqueCategories);
            })
            .catch((err) => console.error("Error fetching products:", err))
            .finally(() => setIsLoadingProducts(false));
    }, []); // <-- This empty array means it only runs on mount

    // This effect runs to update the customer info when the page loads/changes
    useEffect(() => {
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
            setCustomer(JSON.parse(storedCustomer));
        } else {
            setCustomer(null);
        }
    }, [location]);

    // --- 3. NEW FILTERING LOGIC ---
    // This effect runs WHENEVER the user types in the search bar
    // or clicks a category button
    useEffect(() => {
        let productsToFilter = [...allProducts];

        // 1. Apply search term filter
        if (searchTerm) {
            productsToFilter = productsToFilter.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Apply category filter
        if (selectedCategory) {
            productsToFilter = productsToFilter.filter(product =>
                product.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // 3. Update the list of products being displayed
        setFilteredProducts(productsToFilter);

    }, [searchTerm, selectedCategory, allProducts]); // <-- This hook re-runs on these changes

    
    // --- 4. HANDLERS (No changes) ---
    const handleAddToCart = async (product) => {
        if (!customer) {
            alert("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }
        try {
            await addToCart(product, 1);
            alert(`${product.name} ✅ added to cart!`);
        } catch (err) {
            console.log("went wrong", err)
            alert("Failed to add item to cart. Please try again.");
        }
    };

    // --- 5. JSX (MODIFIED) ---
    return (
        <main className="p-8">
            {/* --- NEW SEARCH AND FILTER BARS --- */}
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 mt-4">
                    <button
                        onClick={() => setSelectedCategory("")}
                        className={`px-4 py-2 rounded-full font-semibold ${
                            selectedCategory === "" 
                                ? 'bg-green-700 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        All
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full font-semibold ${
                                selectedCategory === category 
                                    ? 'bg-green-700 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- PRODUCT GRID --- */}
            {isLoadingProducts ? (
                <LoadingSpinner />
            ) : (
                <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* We now map over 'filteredProducts' instead of 'products' */}
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
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
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault(); 
                                            handleAddToCart(p);
                                        }} 
                                        className="w-full mt-4 bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">
                            No products found matching your criteria.
                        </p>
                    )}
                </div>
            )}
        </main>
    );
};

export default CustomerHome;