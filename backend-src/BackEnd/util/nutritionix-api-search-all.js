import 'dotenv/config.js';
import fetch from 'node-fetch';

const MOCK_COMMON_ITEMS = [
  { food_name: "Apple", serving_qty: 1, serving_unit: "medium", tag_name: "apple", locale: "en_US", photo: { thumb: "https://d2e90t8n5g37vy.cloudfront.net/inst/Apple.jpg" } },
  { food_name: "Banana", serving_qty: 1, serving_unit: "medium", tag_name: "banana", locale: "en_US", photo: { thumb: "https://d2e90t8n5g37vy.cloudfront.net/inst/Banana.jpg" } },
  { food_name: "Milk", serving_qty: 1, serving_unit: "cup", tag_name: "milk", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Egg", serving_qty: 1, serving_unit: "large", tag_name: "egg", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Chicken Breast", serving_qty: 100, serving_unit: "g", tag_name: "chicken breast", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Bread", serving_qty: 1, serving_unit: "slice", tag_name: "bread", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Rice", serving_qty: 1, serving_unit: "cup", tag_name: "rice", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Cheese", serving_qty: 1, serving_unit: "slice", tag_name: "cheese", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Tomato", serving_qty: 1, serving_unit: "medium", tag_name: "tomato", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Potato", serving_qty: 1, serving_unit: "medium", tag_name: "potato", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Onion", serving_qty: 1, serving_unit: "medium", tag_name: "onion", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Garlic", serving_qty: 1, serving_unit: "clove", tag_name: "garlic", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Carrot", serving_qty: 1, serving_unit: "medium", tag_name: "carrot", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Broccoli", serving_qty: 1, serving_unit: "cup", tag_name: "broccoli", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Spinach", serving_qty: 1, serving_unit: "cup", tag_name: "spinach", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Salmon", serving_qty: 100, serving_unit: "g", tag_name: "salmon", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Butter", serving_qty: 1, serving_unit: "tbsp", tag_name: "butter", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Olive Oil", serving_qty: 1, serving_unit: "tbsp", tag_name: "olive oil", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Yogurt", serving_qty: 1, serving_unit: "cup", tag_name: "yogurt", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Strawberry", serving_qty: 1, serving_unit: "cup", tag_name: "strawberry", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Blueberry", serving_qty: 1, serving_unit: "cup", tag_name: "blueberry", locale: "en_US", photo: { thumb: "" } },
  { food_name: "Avocado", serving_qty: 1, serving_unit: "medium", tag_name: "avocado", locale: "en_US", photo: { thumb: "" } }
];

const getAllItems = async (query) => {
    if (!query) {
        throw Error('Query is required');
    }

    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://trackapi.nutritionix.com/v2/search/instant?query=${encodedQuery}`;

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'x-app-id': process.env.NUTRITIONIX_APP_ID || '',
                'x-app-key': process.env.NUTRITIONIX_API_KEY || '',
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw Error(data.message || 'Failed to fetch from Nutritionix API');
        }

        if (data.common && data.common.length > 0) {
            return data.common;
        }
        return [];
    } catch (err) {
        console.warn('Nutritionix API failed. Falling back to local mock data.', err.message);
        // Local search fallback
        const lowerQuery = query.toLowerCase();
        const results = MOCK_COMMON_ITEMS.filter(item => 
            item.food_name.toLowerCase().includes(lowerQuery)
        );
        if (results.length === 0 && query.trim().length > 0) {
            const formattedQuery = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
            return [{
                food_name: formattedQuery,
                serving_qty: 1,
                serving_unit: "serving",
                tag_name: query.toLowerCase(),
                locale: "en_US",
                photo: { thumb: "" }
            }];
        }
        return results;
    }
};

export { getAllItems };