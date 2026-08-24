import 'dotenv/config.js';
import fetch from 'node-fetch';

const MOCK_FOOD_DETAILS = {
  "apple": {
    food_name: "Apple",
    brand_name: null,
    serving_qty: 1,
    serving_unit: "medium",
    serving_weight_grams: 182,
    nf_calories: 95,
    nf_total_fat: 0.3,
    nf_saturated_fat: 0.05,
    nf_cholesterol: 0,
    nf_sodium: 2,
    nf_total_carbohydrate: 25,
    nf_dietary_fiber: 4.4,
    nf_sugars: 19,
    nf_protein: 0.5,
    nf_potassium: 195,
    nf_p: 20,
    photo: { thumb: "https://d2e90t8n5g37vy.cloudfront.net/inst/Apple.jpg" },
    alt_measures: [
      { serving_weight: 182, measure: "medium", qty: 1 },
      { serving_weight: 100, measure: "g", qty: 100 }
    ]
  },
  "banana": {
    food_name: "Banana",
    brand_name: null,
    serving_qty: 1,
    serving_unit: "medium",
    serving_weight_grams: 118,
    nf_calories: 105,
    nf_total_fat: 0.4,
    nf_saturated_fat: 0.1,
    nf_cholesterol: 0,
    nf_sodium: 1,
    nf_total_carbohydrate: 27,
    nf_dietary_fiber: 3.1,
    nf_sugars: 14,
    nf_protein: 1.3,
    nf_potassium: 422,
    nf_p: 26,
    photo: { thumb: "https://d2e90t8n5g37vy.cloudfront.net/inst/Banana.jpg" },
    alt_measures: [
      { serving_weight: 118, measure: "medium", qty: 1 },
      { serving_weight: 100, measure: "g", qty: 100 }
    ]
  },
  "milk": {
    food_name: "Milk",
    brand_name: null,
    serving_qty: 1,
    serving_unit: "cup",
    serving_weight_grams: 244,
    nf_calories: 149,
    nf_total_fat: 8,
    nf_saturated_fat: 5,
    nf_cholesterol: 24,
    nf_sodium: 98,
    nf_total_carbohydrate: 12,
    nf_dietary_fiber: 0,
    nf_sugars: 12,
    nf_protein: 8,
    nf_potassium: 322,
    nf_p: 240,
    photo: { thumb: "" },
    alt_measures: [
      { serving_weight: 244, measure: "cup", qty: 1 },
      { serving_weight: 100, measure: "g", qty: 100 }
    ]
  },
  "egg": {
    food_name: "Egg",
    brand_name: null,
    serving_qty: 1,
    serving_unit: "large",
    serving_weight_grams: 50,
    nf_calories: 78,
    nf_total_fat: 5,
    nf_saturated_fat: 1.6,
    nf_cholesterol: 186,
    nf_sodium: 62,
    nf_total_carbohydrate: 0.6,
    nf_dietary_fiber: 0,
    nf_sugars: 0.5,
    nf_protein: 6.3,
    nf_potassium: 63,
    nf_p: 86,
    photo: { thumb: "" },
    alt_measures: [
      { serving_weight: 50, measure: "large", qty: 1 },
      { serving_weight: 100, measure: "g", qty: 100 }
    ]
  },
  "chicken": {
    food_name: "Chicken Breast",
    brand_name: null,
    serving_qty: 1,
    serving_unit: "g",
    serving_weight_grams: 100,
    nf_calories: 165,
    nf_total_fat: 3.6,
    nf_saturated_fat: 1,
    nf_cholesterol: 85,
    nf_sodium: 74,
    nf_total_carbohydrate: 0,
    nf_dietary_fiber: 0,
    nf_sugars: 0,
    nf_protein: 31,
    nf_potassium: 256,
    nf_p: 228,
    photo: { thumb: "" },
    alt_measures: [
      { serving_weight: 100, measure: "g", qty: 100 }
    ]
  },
  "bread": {
    food_name: "Bread",
    brand_name: null,
    serving_qty: 1,
    serving_unit: "slice",
    serving_weight_grams: 25,
    nf_calories: 67,
    nf_total_fat: 1,
    nf_saturated_fat: 0.2,
    nf_cholesterol: 0,
    nf_sodium: 130,
    nf_total_carbohydrate: 12,
    nf_dietary_fiber: 0.6,
    nf_sugars: 1.2,
    nf_protein: 2.2,
    nf_potassium: 25,
    nf_p: 18,
    photo: { thumb: "" },
    alt_measures: [
      { serving_weight: 25, measure: "slice", qty: 1 },
      { serving_weight: 100, measure: "g", qty: 100 }
    ]
  }
};

const getMockDetail = (query) => {
  const key = query.toLowerCase();
  const matchedKey = Object.keys(MOCK_FOOD_DETAILS).find(k => key.includes(k) || k.includes(key));
  if (matchedKey) {
    return [MOCK_FOOD_DETAILS[matchedKey]];
  }
  
  // Default mock details
  return [{
    food_name: query,
    brand_name: null,
    serving_qty: 1,
    serving_unit: "serving",
    serving_weight_grams: 100,
    nf_calories: 120,
    nf_total_fat: 1.5,
    nf_saturated_fat: 0.2,
    nf_cholesterol: 0,
    nf_sodium: 10,
    nf_total_carbohydrate: 15,
    nf_dietary_fiber: 1,
    nf_sugars: 5,
    nf_protein: 2,
    nf_potassium: 100,
    nf_p: 10,
    photo: { thumb: "" },
    alt_measures: [
      { serving_weight: 100, measure: "serving", qty: 1 },
      { serving_weight: 100, measure: "g", qty: 100 }
    ]
  }];
};

const getOneItem = async (query) => {
    if (!query) {
        throw Error('Query is required');
    }
    
    try {
        const url = `https://trackapi.nutritionix.com/v2/natural/nutrients`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-id': process.env.NUTRITIONIX_APP_ID || '',
                'x-app-key': process.env.NUTRITIONIX_API_KEY || '',
            },
            body: JSON.stringify({ query: query }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw Error(data.message || 'Failed to fetch detailed info from Nutritionix');
        }

        if (data.foods && data.foods.length > 0) {
            return data.foods;
        }
        return null;
    } catch (err) {
        console.warn('Nutritionix Detail API failed. Falling back to local mock details.', err.message);
        return getMockDetail(query);
    }
};

export { getOneItem };