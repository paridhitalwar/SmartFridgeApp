import CONFIG from '../config.js';

const getAiRecipeSuggestions = async (fridgeIngredients, pantryIngredients, token) => {
    try {
        const res = await fetch(`${CONFIG.BASE_URL}/api/ai/suggest-recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                fridgeIngredients,
                pantryIngredients,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error(`Error from server: ${errorData.error}`);
            throw new Error(errorData.error || 'Failed to suggest recipes. Please try again.');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error in getAiRecipeSuggestions:', error.message);
        throw new Error(error.message || 'Unable to suggest recipes. Please try again later.');
    }
};

export { getAiRecipeSuggestions };
