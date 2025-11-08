/**
 * Product History Utility
 * Manages recently viewed products and product recommendations
 */

const RECENTLY_VIEWED_KEY = 'buygreen_recently_viewed';
const MAX_RECENT_VIEWED = 12; // Maximum number of recently viewed products to store

/**
 * Add a product to recently viewed
 */
export const addToRecentlyViewed = (product) => {
    if (!product || !product.id) return;

    try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        let recentlyViewed = stored ? JSON.parse(stored) : [];

        // Remove if already exists (to avoid duplicates)
        recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);

        // Add to beginning
        recentlyViewed.unshift({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null),
            category: product.category,
            viewedAt: new Date().toISOString()
        });

        // Keep only the most recent items
        if (recentlyViewed.length > MAX_RECENT_VIEWED) {
            recentlyViewed = recentlyViewed.slice(0, MAX_RECENT_VIEWED);
        }

        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
    } catch (error) {
        console.error('Error saving to recently viewed:', error);
    }
};

/**
 * Get recently viewed products
 */
export const getRecentlyViewed = (limit = 6) => {
    try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (!stored) return [];

        const recentlyViewed = JSON.parse(stored);
        return recentlyViewed.slice(0, limit);
    } catch (error) {
        console.error('Error getting recently viewed:', error);
        return [];
    }
};

/**
 * Clear recently viewed products
 */
export const clearRecentlyViewed = () => {
    try {
        localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (error) {
        console.error('Error clearing recently viewed:', error);
    }
};

/**
 * Get product recommendations based on viewing history
 * Returns products from the same category as recently viewed items
 */
export const getRecommendedCategories = () => {
    try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (!stored) return [];

        const recentlyViewed = JSON.parse(stored);
        
        // Count category occurrences
        const categoryCount = {};
        recentlyViewed.forEach(item => {
            if (item.category) {
                categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
            }
        });

        // Sort by count and return top categories
        return Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);
    } catch (error) {
        console.error('Error getting recommended categories:', error);
        return [];
    }
};

