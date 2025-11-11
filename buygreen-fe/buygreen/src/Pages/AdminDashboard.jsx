import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
        CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmed' },
        PROCESSING: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Processing' },
        SHIPPED: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Shipped' },
        DELIVERED: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered' },
        CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
            {config.label}
        </span>
    );
};

//  2. Component for Viewing Orders 
const OrderList = () => {
    const { success, error } = useToast();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState({});

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchOrders = async (page = 0) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/orders?page=${page}&size=10`, {
                timeout: 30000 // 30 second timeout
            });

            if (response.data && response.data.content) {
                setOrders(response.data.content);
                setCurrentPage(response.data.number || page);
                setTotalPages(response.data.totalPages || 1);
            } else {
                console.error("Invalid response structure:", response.data);
                setOrders([]);
                setTotalPages(1);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            console.error("Error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            // Provide more specific error messages
            if (err.response?.status === 403) {
                error("Access denied. Please ensure you are logged in as an admin.");
            } else if (err.response?.status === 401) {
                error("Session expired. Please login again.");
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else if (!err.response) {
                error("Network error. Please check your connection and try again.");
            } else {
                error("Could not fetch orders. Please try again.");
            }

            // Set empty state on error to prevent infinite loading
            setOrders([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch orders when component mounts or page changes
        fetchOrders(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Add a safety timeout to prevent infinite loading
    useEffect(() => {
        if (isLoading) {
            const timeout = setTimeout(() => {
                if (isLoading) {
                    console.warn("Order fetch taking too long, stopping loading state");
                    setIsLoading(false);
                    error("Request timeout. Please refresh the page.");
                }
            }, 60000); // 60 second safety timeout

            return () => clearTimeout(timeout);
        }
    }, [isLoading]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            const response = await api.put(`/admin/orders/${orderId}/status`,
                { status: newStatus },
                {
                    timeout: 30000 // 30 second timeout
                }
            );

            if (response.data && response.data.message) {
                success(`Order #${orderId} status updated to ${newStatus}`);
            } else {
                success(`Order #${orderId} status updated to ${newStatus}`);
            }

            setSelectedStatus({ ...selectedStatus, [orderId]: '' }); // Reset dropdown
            await fetchOrders(currentPage); // Refresh orders
        } catch (err) {
            console.error("Error updating order status:", err);
            console.error("Error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                url: `/admin/orders/${orderId}/status`
            });

            // Provide more specific error messages
            if (err.response?.status === 403) {
                error("Access denied. You do not have permission to update order status.");
            } else if (err.response?.status === 401) {
                error("Session expired. Please login again.");
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else if (err.response?.status === 404) {
                error(`Order #${orderId} not found.`);
            } else if (!err.response) {
                error("Network error. Please check your connection and try again.");
            } else {
                error(err.response?.data?.message || "Failed to update order status. Please try again.");
            }
        } finally {
            setUpdatingOrderId(null);
        }
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
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold">Order #{order.id}</h3>
                                        <StatusBadge status={order.status || 'PENDING'} />
                                    </div>
                                    <p className="text-sm text-gray-600">Customer ID: {order.customerId}</p>
                                    <p className="text-sm text-gray-600">Date: {new Date(order.orderDate).toLocaleString()}</p>
                                    {order.trackingNumber && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-semibold">Tracking:</span> <span className="font-mono">{order.trackingNumber}</span>
                                        </p>
                                    )}
                                    {(order.street || order.city || order.state || order.pincode) && (
                                        <div className="text-sm text-gray-600 mt-2">
                                            <span className="font-semibold">Delivery Address:</span>
                                            <div className="ml-4 mt-1 space-y-1">
                                                {order.street && <p>{order.street}</p>}
                                                <p>
                                                    {[order.city, order.state, order.pincode].filter(Boolean).join(', ')}
                                                    {order.country && `, ${order.country}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {order.shippingAddress && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-semibold">Shipping Address:</span> {order.shippingAddress}
                                        </p>
                                    )}
                                    {order.location && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-semibold">Location/Landmark:</span> {order.location}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-xl font-bold text-green-700">₹{order.totalAmount.toFixed(2)}</span>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedStatus[order.id] || order.status || 'PENDING'}
                                            onChange={(e) => {
                                                setSelectedStatus({ ...selectedStatus, [order.id]: e.target.value });
                                                handleStatusChange(order.id, e.target.value);
                                            }}
                                            disabled={updatingOrderId === order.id}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="CONFIRMED">Confirmed</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        {updatingOrderId === order.id && (
                                            <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold text-sm mb-2">Items:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {order.items?.map(item => (
                                        <li key={item.id} className="text-sm text-gray-700">
                                            {item.productName} (x{item.quantity}) - ₹{item.price.toFixed(2)} each
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


// --- 3.5. Coupon Manager Component ---
const CouponManager = () => {
    const { success, error } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        expiryDate: '',
        usageLimit: '',
        isActive: true
    });
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/coupons');
            setCoupons(response.data);
        } catch (err) {
            console.error("Error fetching coupons:", err);
            error("Failed to load coupons.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                code: formData.code.toUpperCase().trim(),
                discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
                expiryDate: formData.expiryDate || null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null
            };

            if (editingId) {
                await api.put(`/admin/coupons/${editingId}`, payload);
                success("Coupon updated successfully!");
            } else {
                await api.post("/admin/coupons", payload);
                success("Coupon created successfully!");
            }

            setEditingId(null);
            setFormData({
                code: '',
                discountType: 'PERCENTAGE',
                discountValue: '',
                minOrderAmount: '',
                maxDiscount: '',
                expiryDate: '',
                usageLimit: '',
                isActive: true
            });
            fetchCoupons();
        } catch (err) {
            console.error("Error saving coupon:", err);
            error(err.response?.data?.message || "Failed to save coupon. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) {
            return;
        }

        try {
            await api.delete(`/admin/coupons/${id}`);
            success("Coupon deleted successfully!");
            fetchCoupons();
        } catch (err) {
            console.error("Error deleting coupon:", err);
            error("Failed to delete coupon. Please try again.");
        }
    };

    const handleEdit = (coupon) => {
        setEditingId(coupon.id);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue?.toString() || '',
            minOrderAmount: coupon.minOrderAmount?.toString() || '',
            maxDiscount: coupon.maxDiscount?.toString() || '',
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
            usageLimit: coupon.usageLimit?.toString() || '',
            isActive: coupon.isActive !== false
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({
            code: '',
            discountType: 'PERCENTAGE',
            discountValue: '',
            minOrderAmount: '',
            maxDiscount: '',
            expiryDate: '',
            usageLimit: '',
            isActive: true
        });
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            {/* Coupon Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="SAVE20"
                                disabled={editingId !== null}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            >
                                <option value="PERCENTAGE">Percentage</option>
                                <option value="FIXED">Fixed Amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleChange}
                                required
                                min="0"
                                step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '100'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount (₹)</label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                value={formData.minOrderAmount}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        {formData.discountType === 'PERCENTAGE' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount (₹)</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    placeholder="500"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="Unlimited"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700">Active</label>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Coupons List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <h2 className="text-3xl font-bold text-gray-900 p-8 mb-0 flex items-center gap-3 bg-gradient-to-r from-green-50 to-transparent border-b border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                    </svg>
                    All Coupons ({coupons.length})
                </h2>
                {coupons.length === 0 ? (
                    <p className="p-6 text-gray-500">No coupons found. Create your first coupon above.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="text-left p-4 font-bold text-gray-700">Code</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Type</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Value</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Min Order</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Used</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Status</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="border-b border-gray-100 hover:bg-green-50 transition-colors duration-150">
                                        <td className="p-4">
                                            <span className="font-mono font-bold text-green-700">{coupon.code}</span>
                                        </td>
                                        <td className="p-4 text-gray-800 capitalize">{coupon.discountType?.toLowerCase()}</td>
                                        <td className="p-4 text-gray-800">
                                            {coupon.discountType === 'PERCENTAGE'
                                                ? `${coupon.discountValue}%`
                                                : `₹${coupon.discountValue}`
                                            }
                                        </td>
                                        <td className="p-4 text-gray-800">
                                            {coupon.minOrderAmount ? `₹${coupon.minOrderAmount.toFixed(2)}` : 'No minimum'}
                                        </td>
                                        <td className="p-4 text-gray-800">
                                            {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${coupon.isActive
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 3.6. Sales Analytics Component ---
const SalesAnalytics = () => {
    const { error } = useToast();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/analytics/sales');
            setAnalytics(response.data);
        } catch (err) {
            console.error("Error fetching sales analytics:", err);
            error("Failed to load sales analytics.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (!analytics) return <p className="p-6 text-gray-500">No analytics data available.</p>;

    const ordersByDate = analytics.ordersByDate || {};
    const revenueByDate = analytics.revenueByDate || {};
    const dates = Object.keys(ordersByDate).sort();

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Total Revenue</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">₹{Number(analytics.totalRevenue || 0).toFixed(2)}</p>
                    <p className="text-sm opacity-80 mt-2">All time revenue</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Total Orders</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{analytics.totalOrders || 0}</p>
                    <p className="text-sm opacity-80 mt-2">Orders placed</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Avg Order Value</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">₹{Number(analytics.averageOrderValue || 0).toFixed(2)}</p>
                    <p className="text-sm opacity-80 mt-2">Per order average</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">Items Sold</h3>
                        <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold">{analytics.totalItemsSold || 0}</p>
                    <p className="text-sm opacity-80 mt-2">Total units sold</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Orders by Status</h3>
                    <div className="space-y-3">
                        {analytics.ordersByStatus && Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-gray-700 capitalize">{status.toLowerCase()}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${(count / (analytics.totalOrders || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-gray-900 font-semibold w-12 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue by Status */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Status</h3>
                    <div className="space-y-3">
                        {analytics.revenueByStatus && Object.entries(analytics.revenueByStatus).map(([status, revenue]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-gray-700 capitalize">{status.toLowerCase()}</span>
                                <span className="text-green-700 font-bold">₹{Number(revenue).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 30-Day Trends */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Last 30 Days Trends</h3>
                <div className="space-y-4">
                    {dates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-3">Orders per Day</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {dates.map(date => (
                                        <div key={date} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">{new Date(date).toLocaleDateString()}</span>
                                            <span className="font-semibold">{ordersByDate[date] || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-3">Revenue per Day</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {dates.map(date => (
                                        <div key={date} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">{new Date(date).toLocaleDateString()}</span>
                                            <span className="font-semibold text-green-700">₹{Number(revenueByDate[date] || 0).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No data available for the last 30 days</p>
                    )}
                </div>
            </div>

            {/* Discounts Summary */}
            {analytics.totalDiscounts && Number(analytics.totalDiscounts) > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Total Discounts Given</h3>
                            <p className="text-sm text-gray-600">Total amount saved by customers through coupons</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-orange-700">₹{Number(analytics.totalDiscounts).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 3.7. Customer Analytics Component ---
const CustomerAnalytics = () => {
    const { error } = useToast();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/analytics/customers');
            setAnalytics(response.data);
        } catch (err) {
            console.error("Error fetching customer analytics:", err);
            error("Failed to load customer analytics.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (!analytics) return <p className="p-6 text-gray-500">No analytics data available.</p>;

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-600">Total Customers</h3>
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalCustomers || 0}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-600">Active Customers</h3>
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.activeCustomers || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">With at least one order</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-600">New Customers</h3>
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{analytics.newCustomersLast30Days || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-600">Avg Order Value</h3>
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">₹{Number(analytics.averageOrderValuePerCustomer || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-1">Per active customer</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Activity</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Orders</span>
                            <span className="text-xl font-bold text-gray-900">{analytics.totalOrders || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Revenue</span>
                            <span className="text-xl font-bold text-green-700">₹{Number(analytics.totalRevenue || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                            <span className="text-gray-600">Active Rate</span>
                            <span className="text-xl font-bold text-blue-700">
                                {analytics.totalCustomers > 0
                                    ? ((analytics.activeCustomers / analytics.totalCustomers) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg border border-green-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Insights</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">
                                <strong>{analytics.activeCustomers || 0}</strong> customers have made purchases
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">
                                <strong>{analytics.totalCustomers - (analytics.activeCustomers || 0)}</strong> customers are yet to make their first purchase
                            </span>
                        </div>
                        {analytics.newCustomersLast30Days > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-gray-700">
                                    <strong>{analytics.newCustomersLast30Days}</strong> new customers joined in the last 30 days
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3.8. Inventory Alerts Component ---
const InventoryAlerts = () => {
    const { error } = useToast();
    const [alerts, setAlerts] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/analytics/inventory');
            setAlerts(response.data);
        } catch (err) {
            console.error("Error fetching inventory alerts:", err);
            error("Failed to load inventory alerts.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (!alerts) return <p className="p-6 text-gray-500">No inventory data available.</p>;

    return (
        <div className="space-y-6">
            {/* Alert Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`rounded-xl shadow-lg p-6 border-2 ${alerts.totalOutOfStockCount > 0
                    ? 'bg-red-50 border-red-300'
                    : 'bg-green-50 border-green-300'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Out of Stock</h3>
                        <svg className={`w-8 h-8 ${alerts.totalOutOfStockCount > 0 ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-4xl font-bold mb-2">{alerts.totalOutOfStockCount || 0}</p>
                    <p className="text-sm text-gray-600">Products need restocking</p>
                </div>

                <div className={`rounded-xl shadow-lg p-6 border-2 ${alerts.totalLowStockCount > 0
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-green-50 border-green-300'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Low Stock</h3>
                        <svg className={`w-8 h-8 ${alerts.totalLowStockCount > 0 ? 'text-yellow-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-4xl font-bold mb-2">{alerts.totalLowStockCount || 0}</p>
                    <p className="text-sm text-gray-600">Products running low (≤10 units)</p>
                </div>
            </div>

            {/* Out of Stock Products */}
            {alerts.outOfStockProducts && alerts.outOfStockProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 overflow-hidden">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                        <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Out of Stock Products ({alerts.outOfStockProducts.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50">
                                    <th className="text-left p-4 font-bold text-gray-700">Product Name</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Category</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Stock</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.outOfStockProducts.map(product => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                                        <td className="p-4 font-semibold text-gray-900">{product.name}</td>
                                        <td className="p-4 text-gray-600">{product.category || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">0</span>
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                to={`/AdminDashboard?tab=products&edit=${product.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                            >
                                                Update Stock →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Low Stock Products */}
            {alerts.lowStockProducts && alerts.lowStockProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 overflow-hidden">
                    <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
                        <h3 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Low Stock Products ({alerts.lowStockProducts.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200 bg-gray-50">
                                    <th className="text-left p-4 font-bold text-gray-700">Product Name</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Category</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Stock</th>
                                    <th className="text-left p-4 font-bold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.lowStockProducts.map(product => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-yellow-50 transition-colors">
                                        <td className="p-4 font-semibold text-gray-900">{product.name}</td>
                                        <td className="p-4 text-gray-600">{product.category || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                                                {product.stockQuantity} left
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                to={`/AdminDashboard?tab=products&edit=${product.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                            >
                                                Update Stock →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Good Message */}
            {alerts.totalOutOfStockCount === 0 && alerts.totalLowStockCount === 0 && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl shadow-lg p-12 text-center">
                    <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">All Products in Stock!</h3>
                    <p className="text-green-700">No inventory alerts at this time.</p>
                </div>
            )}
        </div>
    );
};

// --- 4. Main AdminDashboard Component (The Tab Controller) ---
function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'customers', 'coupons', 'analytics', 'customers-analytics', 'inventory'

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return <ProductManager />;
            case 'orders':
                return <OrderList />;
            case 'customers':
                return <CustomerList />;
            case 'coupons':
                return <CouponManager />;
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
                            <button
                                onClick={() => setActiveTab('coupons')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'coupons'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                                </svg>
                                Coupons
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'analytics'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 3v18h18"></path>
                                    <path d="M18 7v10"></path>
                                    <path d="M13 12v5"></path>
                                    <path d="M8 9v8"></path>
                                </svg>
                                Sales Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('customers-analytics')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'customers-analytics'
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
                                Customer Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'inventory'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                                Inventory Alerts
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