import 'dotenv/config.js';
import fetch from 'node-fetch';

const MOCK_RECIPES = [
  {
    recipeName: "Strawberry Banana Smoothie",
    ingredients: [
      { foodName: "Banana", quantity: "1", measurement: "medium", calories: 105 },
      { foodName: "Strawberry", quantity: "1", measurement: "cup", calories: 50 },
      { foodName: "Yogurt", quantity: "1", measurement: "cup", calories: 150 },
      { foodName: "Milk", quantity: "0.5", measurement: "cup", calories: 75 }
    ],
    instructions: "Add all ingredients into a blender. Blend on high until completely smooth. Pour into a glass and enjoy cold!",
    calories: 380
  },
  {
    recipeName: "Chicken & Broccoli Stir-Fry",
    ingredients: [
      { foodName: "Chicken Breast", quantity: "150", measurement: "g", calories: 250 },
      { foodName: "Broccoli", quantity: "1", measurement: "cup", calories: 30 },
      { foodName: "Garlic", quantity: "2", measurement: "cloves", calories: 10 }
    ],
    instructions: "Cut chicken breast into bite-sized pieces. Heat oil in a pan, add minced garlic and chicken, and sauté for 5 minutes. Toss in broccoli florets and cook until chicken is fully cooked and broccoli is tender.",
    calories: 290
  },
  {
    recipeName: "Simple Fruit Salad",
    ingredients: [
      { foodName: "Apple", quantity: "1", measurement: "medium", calories: 95 },
      { foodName: "Banana", quantity: "1", measurement: "medium", calories: 105 },
      { foodName: "Strawberry", quantity: "0.5", measurement: "cup", calories: 25 }
    ],
    instructions: "Chop the apple and banana into small bite-sized pieces. Slice the strawberries. Combine all fruits in a bowl, mix gently, and serve immediately.",
    calories: 225
  }
];

export async function suggestRecipes(req, res) {
  try {
    const { fridgeIngredients, pantryIngredients } = req.body;

    const fridgeList = Array.isArray(fridgeIngredients) ? fridgeIngredients : [];
    const pantryList = Array.isArray(pantryIngredients) ? pantryIngredients : [];

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("Groq API key is not configured on the server. Returning mock recipe suggestions.");
      return res.json({ recipes: MOCK_RECIPES });
    }

    const prompt = `
You are a professional chef and nutritionist.
Given the following ingredients currently available:
Fridge: ${fridgeList.join(', ')}
Pantry: ${pantryList.join(', ')}

Please suggest 3 delicious, healthy, and easy-to-cook recipes that can be made using these ingredients (you may assume standard pantry staples like salt, water, pepper, and cooking oil are available).

You must return a JSON object with the following exact structure:
{
  "recipes": [
    {
      "recipeName": "Recipe Name",
      "ingredients": [
        {
          "foodName": "Ingredient Name",
          "quantity": "1.5",
          "measurement": "cups / grams / tbsp / units",
          "calories": 150
        }
      ],
      "instructions": "Provide step-by-step instructions as a single paragraph or bulleted list.",
      "calories": 450
    }
  ]
}

Ensure:
- All ingredient calorie estimates and total recipe calorie counts are realistic and accurate.
- Output ONLY the raw JSON object. Do not include markdown formatting tags like \`\`\`json or \`\`\$, and no introductory or concluding text.
`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-specdec',
          messages: [
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Groq API Error Response:', data);
        throw new Error(data.error?.message || 'Failed to fetch suggestions from Groq API');
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from Groq completions API');
      }

      const parsedJson = JSON.parse(content);
      res.json(parsedJson);
    } catch (apiError) {
      console.warn('Groq API call failed. Falling back to mock recipe suggestions:', apiError.message);
      res.json({ recipes: MOCK_RECIPES });
    }

  } catch (error) {
    console.error('Error generating recipe suggestions:', error);
    res.status(500).json({ error: 'Failed to generate recipe suggestions due to a server error' });
  }
}
