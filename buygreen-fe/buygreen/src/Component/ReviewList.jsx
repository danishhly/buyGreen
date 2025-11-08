import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import StarRating from './StarRating'; // Import our new component

const ReviewList = ({ productId, refreshKey }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (productId) {
            const fetchReviews = async () => {
                setIsLoading(true);
                try {
                    // Use the public endpoint to get reviews
                    const response = await api.get(`/products/${productId}/reviews`);
                    setReviews(Array.isArray(response.data) ? response.data : []);
                } catch (err) {
                    console.error("Error fetching reviews:", err);
                    setReviews([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchReviews();
        }
    }, [productId, refreshKey]); // Include refreshKey to force re-fetch

    if (isLoading) {
        return <p className="text-gray-600">Loading reviews...</p>;
    }

    if (reviews.length === 0) {
        return <p className="text-gray-600">No reviews yet. Be the first to leave one!</p>;
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                    <div className="flex items-center mb-2">
                        <StarRating rating={review.rating} />
                        <span className="ml-3 font-semibold text-gray-800">{review.customerName}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                        {review.reviewDate 
                            ? (typeof review.reviewDate === 'string' 
                                ? new Date(review.reviewDate).toLocaleDateString() 
                                : new Date(review.reviewDate).toLocaleDateString())
                            : 'Recently'}
                    </p>
                    <p className="text-gray-700">{review.comment}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;