import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// A component for the star rating input
const StarInput = ({ rating, setRating }) => {
    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`w-8 h-8 ${star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'} transition-colors`}
                    >
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
                    </svg>
                </button>
            ))}
        </div>
    );
};


const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [eligibility, setEligibility] = useState({ canReview: false, reason: 'Checking...' });
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check if the user is eligible to write a review
    useEffect(() => {
        const checkEligibility = async () => {
            try {
                // This is our new secure endpoint
                const response = await api.get(`/products/${productId}/reviews/check`);
                setEligibility(response.data);
            } catch (err) {
                // This likely means the user is not logged in
                setEligibility({ canReview: false, reason: "Please log in to leave a review." });
            }
        };
        checkEligibility();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            // This is our secure POST endpoint
            await api.post(`/products/${productId}/reviews`, {
                rating,
                comment
            });
            // Reset form and tell the parent to refresh the review list
            setRating(0);
            setComment('');
            onReviewSubmitted(); 
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!eligibility.canReview) {
        return (
            <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-gray-700">{eligibility.reason}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold">Write a review</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating *</label>
                <StarInput rating={rating} setRating={setRating} />
            </div>
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Review</label>
                <textarea
                    id="comment"
                    name="comment"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm"
                ></textarea>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800 disabled:opacity-50"
                >
                    {isLoading ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;