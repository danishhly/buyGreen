import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useToast } from "../Component/Toast";
import { validateRequired, validatePrice, validateStock, validateImageUrls } from "../utils/validation";

// --- LoadingSpinner ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-700"></div>
    </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-between items-center mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                &larr; Previous
            </button>
            <span className="text-gray-700 font-medium">
                Page {currentPage + 1} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage + 1 >= totalPages}
                className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Next &rarr;
            </button>
        </div>
    );
};


const ProductManager = () => {
    const { success, error } = useToast();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        imageUrls: "", // Use plural to match our new backend
        category: "",
        stockQuantity: "",
    });

    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (page = 0, query = "") => {
        try {
            setIsLoading(true);
            let response;
            if (query && query.trim() !== "") {
                // Use search endpoint when there's a query
                response = await api.get(`/products/search?query=${encodeURIComponent(query)}&page=${page}&size=6`);
            } else {
                // Use regular endpoint when no query
                response = await api.get(`/products/all?page=${page}&size=6`);
            }
            setProducts(response.data.content);
            setCurrentPage(response.data.number);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error("Error fetching products:", err);
            error("Failed to load products.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(currentPage, searchQuery);
    }, [currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0); // Reset to first page when searching
        fetchProducts(0, searchQuery);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setCurrentPage(0);
        fetchProducts(0, "");
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        const nameValidation = validateRequired(formData.name, "Product name");
        if (!nameValidation.isValid) {
            error(nameValidation.message);
            return;
        }

        const priceValidation = validatePrice(formData.price);
        if (!priceValidation.isValid) {
            error(priceValidation.message);
            return;
        }

        const imageUrlsValidation = validateImageUrls(formData.imageUrls);
        if (!imageUrlsValidation.isValid) {
            error(imageUrlsValidation.message);
            return;
        }

        // Validate stock quantity if provided
        if (formData.stockQuantity && formData.stockQuantity !== "") {
            const stockValidation = validateStock(formData.stockQuantity);
            if (!stockValidation.isValid) {
                error(stockValidation.message);
                return;
            }
        }

        const imagesArray = formData.imageUrls.split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);

        // Create the payload with the correct plural 'imageUrls'
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity, 10) : 0,
            imageUrls: imagesArray
        };

        try {
            if (editingId) {
                // Pass the 'payload' object, not 'formData'
                await api.put(`/products/update/${editingId}`, payload);
                success("Product updated successfully!");
            } else {
                // Pass the 'payload' object, not 'formData'
                await api.post("/products/add", payload);
                success("Product added successfully!");
            }

            setEditingId(null);
            setFormData({ name: "", description: "", price: "", imageUrls: "", category: "", stockQuantity: "" });
            fetchProducts(currentPage, searchQuery);
        } catch (err) {
            console.error("Error saving product:", err);
            error(err.response?.data?.message || "Failed to save product. Please try again.");
        }
    };

    const handleSelectProductForUpdate = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price,
            // Use 'imageUrls' and join them
            imageUrls: product.imageUrls ? product.imageUrls.join(', ') : '',
            category: product.category || "",
            stockQuantity: product.stockQuantity || ""
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", description: "", price: "", imageUrls: "", category: "", stockQuantity: "" });
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        try {
            await api.delete(`/products/delete/${id}`);
            success("Product deleted successfully!");
            fetchProducts(currentPage, searchQuery);
        } catch (err) {
            console.error("Error deleting product:", err);
            error("Failed to delete product. Please try again.");
        }
    };

    return (
        <div>
            {/* Add/Edit Product Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    {editingId ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    )}
                    {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter product name"
                                onChange={handleChange}
                                value={formData.name}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                            <input
                                type="number"
                                name="price"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                onChange={handleChange}
                                value={formData.price}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            placeholder="Enter product description"
                            onChange={handleChange}
                            value={formData.description}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none hover:border-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <input
                                type="text"
                                name="category"
                                placeholder="e.g., DrinkWare, Tables"
                                onChange={handleChange}
                                value={formData.category}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                            <input
                                type="number"
                                name="stockQuantity"
                                placeholder="0"
                                min="0"
                                onChange={handleChange}
                                value={formData.stockQuantity}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Image URLs *</label>
                        <input
                            type="text"
                            name="imageUrls" // Corrected from imageUrl
                            placeholder="Enter image URLs separated by commas"
                            onChange={handleChange}
                            value={formData.imageUrls} // Corrected from imageUrl
                            required // Added required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-xs text-gray-500">Separate multiple URLs with commas</p>
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                        <button
                            type="submit"
                            className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            {editingId ? 'Update Product' : 'Add Product'}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-8 py-3.5 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Products List */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                        Products ({products.length})
                    </h2>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search products by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-400 shadow-sm"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            Search
                        </button>
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="px-8 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Clear
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            {/* Product Image */}
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                {(product.imageUrls && product.imageUrls.length > 0) ? (
                                    <img
                                        src={product.imageUrls[0]} // Always show the first image
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                {product.stockQuantity <= 0 && (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        Out of Stock
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    {product.category || 'Uncategorized'}
                                </p>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {product.description || 'No description'}
                                </p>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-green-700">
                                        ₹{typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Stock: <span className="font-semibold">{product.stockQuantity || 0}</span>
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleSelectProductForUpdate(product)}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-16 text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-500">Add your first product using the form above.</p>
                </div>
            )}
            {totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

//  2. Component for Viewing Orders 
const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchOrders = async (page = 0) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/orders?page=${page}&size=10`);
            setOrders(response.data.content);
            setCurrentPage(response.data.number);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error("Error fetching orders:", err);
            error("Could not fetch orders. Make sure you are an admin.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };


    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 p-8 mb-0 flex items-center gap-3 bg-gradient-to-r from-green-50 to-transparent border-b border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                All Orders ({orders.length})
            </h2>
            {orders.length === 0 ? <p className="p-6 text-gray-500">No orders found.</p> : (
                <div className="space-y-4 p-6 pt-0">
                    {orders.map(order => (
                        <div key={order.id} className="border-2 border-gray-200 p-6 rounded-xl hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <h3 className="text-lg font-bold">Order #{order.id}</h3>
                                    <p className="text-sm text-gray-600">Customer ID: {order.customerId}</p>
                                    <p className="text-sm text-gray-600">Date: {new Date(order.orderDate).toLocaleString()}</p>
                                </div>
                                <span className="text-lg text-gray-900 font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="mt-2 border-t pt-2">
                                <h4 className="font-semibold text-sm">Items:</h4>
                                <ul className="list-disc pl-5">
                                    {order.items.map(item => (
                                        <li key={item.id} className="text-sm text-gray-700">
                                            {item.productName} (x{item.quantity}) - ₹{item.price.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                    {totalPages > 1 && (
                        <div className="p-6 border-t">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- 3. New Component for Viewing Customers (From previous step) ---
const CustomerList = () => {
    const { success, error } = useToast();
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchCustomers = async (page = 0) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/customers?page=${page}&size=10`);
            setCustomers(response.data.content);
            setCurrentPage(response.data.number);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error("Error fetching customers:", err);
            error("Could not fetch customers. Make sure you are an admin.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const deleteCustomer = async (id, email, role) => {
        // Get current admin info
        const storedCustomer = localStorage.getItem('customer');
        const currentAdmin = storedCustomer ? JSON.parse(storedCustomer) : null;

        // Prevent deleting yourself
        if (currentAdmin && currentAdmin.id === id) {
            error("You cannot delete your own account.");
            return;
        }

        // Show different confirmation message for admin users
        const isAdmin = role === 'admin';
        const confirmMessage = isAdmin
            ? `⚠️ WARNING: Are you sure you want to delete admin user "${email}"? This action cannot be undone and will remove all admin privileges.`
            : `Are you sure you want to delete customer "${email}"? This action cannot be undone.`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setDeletingId(id);
        try {
            await api.delete(`/admin/customers/${id}`);
            success(isAdmin ? "Admin user deleted successfully!" : "Customer deleted successfully!");
            // Refresh the list
            fetchCustomers(currentPage);
        } catch (err) {
            console.error("Error deleting customer:", err);
            error(err.response?.data?.message || "Failed to delete customer. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <h2 className="text-3xl font-bold text-gray-900 p-8 mb-0 flex items-center gap-3 bg-gradient-to-r from-green-50 to-transparent border-b border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                All Customers ({customers.length})
            </h2>
            {customers.length === 0 ? <p className="p-6 text-gray-500">No customers found.</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <th className="text-left p-4 font-bold text-gray-700">ID</th>
                                <th className="text-left p-4 font-bold text-gray-700">Name</th>
                                <th className="text-left p-4 font-bold text-gray-700">Email</th>
                                <th className="text-left p-4 font-bold text-gray-700">Role</th>
                                <th className="text-left p-4 font-bold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => {
                                const storedCustomer = localStorage.getItem('customer');
                                const currentAdmin = storedCustomer ? JSON.parse(storedCustomer) : null;
                                const isCurrentUser = currentAdmin && currentAdmin.id === customer.id;
                                const isAdmin = customer.role === 'admin';

                                return (
                                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-green-50 transition-colors duration-150">
                                        <td className="p-4 text-gray-800">{customer.id}</td>
                                        <td className="p-4 text-gray-800">{customer.name}</td>
                                        <td className="p-4 text-gray-800">{customer.email}</td>
                                        <td className="p-4 text-gray-800 capitalize">
                                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${isAdmin ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                {customer.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => deleteCustomer(customer.id, customer.email, customer.role)}
                                                disabled={deletingId === customer.id || isCurrentUser}
                                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${deletingId === customer.id
                                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                                    : isCurrentUser
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : isAdmin
                                                            ? 'bg-red-700 text-white hover:bg-red-800 shadow-sm hover:shadow-md border-2 border-red-800'
                                                            : 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
                                                    }`}
                                                title={isCurrentUser ? 'Cannot delete your own account' : isAdmin ? 'Delete admin user' : 'Delete customer'}
                                            >
                                                {deletingId === customer.id ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                        Delete
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {totalPages > 1 && (
                <div className="p-6 border-t">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

        </div>
    );
};


// --- 4. Main AdminDashboard Component (The Tab Controller) ---
function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'customers'

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return <ProductManager />;
            case 'orders':
                return <OrderList />;
            case 'customers':
                return <CustomerList />;
            default:
                return <ProductManager />;
        }
    };

    // Helper to get tab button styles
    const getTabClass = (tabName) => {
        return activeTab === tabName
            ? 'border-green-600 text-green-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    };

    // Get admin name from localStorage
    const storedCustomer = localStorage.getItem('customer');
    const adminName = storedCustomer ? JSON.parse(storedCustomer).name : 'Admin';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="9" y1="3" x2="9" y2="21"></line>
                                    <line x1="3" y1="9" x2="21" y2="9"></line>
                                </svg>
                                Admin Dashboard
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Welcome back, {adminName}</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                <path d="M9 12l2 2 4-4"></path>
                                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                <path d="M12 21c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                <path d="M12 3c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                            </svg>
                            <span className="text-sm font-semibold text-green-700">Admin Access</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                        <nav className="flex space-x-2" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'products'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                                Manage Products
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'orders'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                View Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('customers')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'customers'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                View Customers
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="transition-all duration-300">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;