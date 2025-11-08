import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentlyViewed } from '../utils/productHistory';

const RecentlyViewed = ({ limit = 6 }) => {
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    useEffect(() => {
        const items = getRecentlyViewed(limit);
        setRecentlyViewed(items);
    }, [limit]);

    if (recentlyViewed.length === 0) {
        return null;
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recently Viewed
                </h2>
                <p className="text-gray-600">Products you've recently browsed</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentlyViewed.map((item) => (
                    <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                        <div className="relative aspect-square bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
                                {item.name}
                            </h3>
                            <p className="text-lg font-bold text-green-600">
                                ₹{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default RecentlyViewed;

