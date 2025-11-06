import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";

function AdminDashboard() {
    const [products, setProducts] = useState([]);
    // 1. State uses 'stockQuantity' (lowercase 's')
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        category: "",
        stockQuantity: "", 
    });
    
    const [editingId, setEditingId] = useState(null); // Tracks which product we are editing

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const response = await api.get("/products/all");
        setProducts(response.data);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // This function handles BOTH create and update
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || formData.name.trim() === "" || !formData.price) {
            alert("Please fill in at least the Name and Price fields.");
            return;
        }

        if (editingId) {
            // We are UPDATING
            try {
                await api.put(`/products/update/${editingId}`, formData);
                alert("Product updated successfully!");
            } catch (err) {
                console.error("Error updating product:", err);
                alert("Failed to update product.");
            }
        } else {
            // We are CREATING
            try {
                await api.post("/products/add", formData);
                alert("Product added successfully!");
            } catch (err) {
                console.error("Error adding product:", err);
                alert("Failed to add product.");
            }
        }

        // Reset form and state
        setEditingId(null);
        setFormData({ name: "", description: "", price: "", imageUrl: "", category: "", stockQuantity: "" });
        fetchProducts();
    };

    // This function populates the form for editing
    const handleSelectProductForUpdate = (product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            stockQuantity: product.stockQuantity // Uses lowercase 's'
        });
    };

    const deleteProduct = async (id) => {
        await api.delete(`http://localhost:8080/products/delete/${id}`);
        fetchProducts();
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-green-700 mb-6">Admin Dashboard</h1>

            {/* Form now uses handleSubmit */}
            <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-xl font-bold mb-2">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <input type="text" name="name" placeholder="Name" onChange={handleChange} value={formData.name} required className="w-full border p-2 rounded" />
                <input type="text" name="description" placeholder="Description" onChange={handleChange} value={formData.description} required className="w-full border p-2 rounded" />
                <input type="number" name="price" placeholder="Price" onChange={handleChange} value={formData.price} required className="w-full border p-2 rounded" />
                <input type="text" name="imageUrl" placeholder="Image URL" onChange={handleChange} value={formData.imageUrl} required className="w-full border p-2 rounded" />
                <input type="text" name="category" placeholder="Category" onChange={handleChange} value={formData.category} required className="w-full border p-2 rounded" />
                
                {/* 2. THE FIX: 'name' and 'value' now use lowercase 'stockQuantity' */}
                <input 
                    type="number" 
                    name="stockQuantity" 
                    placeholder="Stock Quantity" 
                    onChange={handleChange} 
                    value={formData.stockQuantity} 
                    required 
                    className="w-full border p-2 rounded" 
                />
                
                {/* Button text is dynamic */}
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    {editingId ? 'Update Product' : 'Add Product'}
                </button>

                {/* Cancel Edit Button */}
                {editingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: "", description: "", price: "", imageUrl: "", category: "", stockQuantity: "" });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
                    >
                        Cancel Edit
                    </button>
                )}
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((p) => (
                    <div key={p.id} className="border p-4 rounded-lg shadow bg-white">
                        {/* Fix: use p.imageUrl */}
                        {p.imageUrl && (<img src={p.imageUrl} alt={p.name} className="h-40 w-full object-cover rounded" />)}
                        <h2 className="text-lg font-bold mt-2">{p.name}</h2>
                        <p>{p.description}</p>
                        <p className="text-green-700 font-semibold">₹{p.price}</p>
                        <button onClick={() => deleteProduct(p.id)} className="bg-red-500 text-white px-3 py-1 mt-2 rounded hover:bg-red-600">Delete</button>
                        
                        {/* Update button uses the new function */}
                        <button onClick={() => handleSelectProductForUpdate(p)} className="bg-blue-500 text-white px-4 py-1 mt-2 rounded hover:bg-blue-600 ml-2">
                            Update
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminDashboard;