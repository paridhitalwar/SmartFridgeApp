import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import useUser from "../hooks/userHook";
import { getUserFridge } from "../api/fridgeController";
import { getUserPantry } from "../api/pantryController";
import { getAiRecipeSuggestions } from "../api/aiController";
import { addRecipe } from "../api/recipeController";
import BottomNav from "@/components/BottomNav";

interface Ingredient {
  foodName: string;
  quantity: string;
  measurement: string;
  calories: number;
}

interface Recipe {
  recipeName: string;
  ingredients: Ingredient[];
  instructions: string;
  calories: number;
}

const AiRecipes: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [fridgeItems, setFridgeItems] = useState<any[]>([]);
  const [pantryItems, setPantryItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [savingRecipeIndex, setSavingRecipeIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user?.token) {
      fetchInventory();
    }
  }, [user?.token]);

  const fetchInventory = async () => {
    try {
      const fridgeData = await getUserFridge(user.token);
      setFridgeItems(fridgeData.ingredients || []);
      
      const pantryData = await getUserPantry(user.token);
      setPantryItems(pantryData.ingredients || []);
    } catch (error: any) {
      console.error("Error fetching inventory:", error.message);
    }
  };

  const handleGenerateRecipes = async () => {
    if (fridgeItems.length === 0 && pantryItems.length === 0) {
      Alert.alert(
        "No Ingredients",
        "Add some items to your Fridge or Pantry first so the AI can suggest recipes!"
      );
      return;
    }

    try {
      setIsLoading(true);
      
      // Loading states micro-animations/steps
      setLoadingStep("Inspecting Fridge & Pantry...");
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(800);
      
      setLoadingStep("Consulting the AI Chef...");
      await delay(600);
      
      setLoadingStep("Calculating nutrition & calories...");
      
      const fridgeNames = fridgeItems.map((item) => item.foodName);
      const pantryNames = pantryItems.map((item) => item.foodName);

      const response = await getAiRecipeSuggestions(fridgeNames, pantryNames, user.token);
      
      if (response && response.recipes) {
        setRecipes(response.recipes);
      } else {
        throw new Error("Invalid response structure from AI assistant.");
      }
    } catch (error: any) {
      Alert.alert("AI Suggestion Failed", error.message || "An error occurred while generating suggestions.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleSaveRecipe = async (recipe: Recipe, index: number) => {
    try {
      setSavingRecipeIndex(index);
      
      const mealData = {
        recipeName: recipe.recipeName,
        ingredients: recipe.ingredients.map((ing) => ({
          foodName: ing.foodName,
          quantity: ing.quantity,
          calories: ing.calories || 0,
          measurement: ing.measurement,
        })),
        instructions: recipe.instructions,
        calories: recipe.calories,
      };

      await addRecipe(mealData, user.token);
      Alert.alert("Success", `"${recipe.recipeName}" has been saved to your recipes!`);
    } catch (error: any) {
      Alert.alert("Save Failed", error.message || "Could not save the recipe.");
    } finally {
      setSavingRecipeIndex(null);
    }
  };

  const handleNavigation = (tab: string) => {
    switch (tab) {
      case "Home":
        router.push("/homepage");
        break;
      case "Pantry":
        router.push("/Fridge_Pantry");
        break;
      case "Meals":
        router.push("/meal-plan/calendarpage");
        break;
      case "Recipes":
        router.push("/recipes");
        break;
      case "Profile":
        router.push("/ProfilePage");
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>AI Recipe Chef</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ingredients Summary Section */}
        <View style={styles.inventoryCard}>
          <Text style={styles.sectionTitle}>Your Ingredients Available</Text>
          <View style={styles.badgeContainer}>
            {fridgeItems.map((item, idx) => (
              <View key={`fridge-${idx}`} style={[styles.badge, styles.fridgeBadge]}>
                <Text style={styles.badgeText}>{item.foodName}</Text>
              </View>
            ))}
            {pantryItems.map((item, idx) => (
              <View key={`pantry-${idx}`} style={[styles.badge, styles.pantryBadge]}>
                <Text style={styles.badgeText}>{item.foodName}</Text>
              </View>
            ))}
            {fridgeItems.length === 0 && pantryItems.length === 0 && (
              <Text style={styles.emptyText}>Fridge & Pantry are currently empty.</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateRecipes}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.generateButtonText}>✨ Ask AI for Recipes ✨</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFA500" />
            <Text style={styles.loadingStepText}>{loadingStep}</Text>
          </View>
        )}

        {/* Suggested Recipes Section */}
        {!isLoading && recipes.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>AI Recommendations</Text>
            {recipes.map((recipe, index) => (
              <View key={`recipe-${index}`} style={styles.recipeCard}>
                <View style={styles.recipeCardHeader}>
                  <Text style={styles.recipeName}>{recipe.recipeName}</Text>
                  <View style={styles.calorieBadge}>
                    <Text style={styles.calorieText}>{recipe.calories} cal</Text>
                  </View>
                </View>

                <Text style={styles.recipeSubtitle}>Ingredients:</Text>
                {recipe.ingredients.map((ing, iIdx) => (
                  <Text key={iIdx} style={styles.ingredientItem}>
                    • {ing.foodName} - {ing.quantity} {ing.measurement} ({ing.calories} cal)
                  </Text>
                ))}

                <Text style={styles.recipeSubtitle}>Instructions:</Text>
                <Text style={styles.instructionsText}>{recipe.instructions}</Text>

                <TouchableOpacity
                  style={styles.saveRecipeButton}
                  onPress={() => handleSaveRecipe(recipe, index)}
                  disabled={savingRecipeIndex === index}
                >
                  {savingRecipeIndex === index ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveRecipeButtonText}>💾 Add to My Recipes</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {!isLoading && recipes.length === 0 && (
          <View style={styles.emptyPromptContainer}>
            <Text style={styles.emptyPromptTitle}>Hungry for suggestions?</Text>
            <Text style={styles.emptyPromptSubtitle}>
              Click the button above to generate custom healthy recipes using ingredients currently in your kitchen.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav
        items={["Home", "Pantry", "Meals", "Recipes", "Profile"]}
        onNavigate={handleNavigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#FFA500",
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  inventoryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    margin: 4,
  },
  fridgeBadge: {
    backgroundColor: "#ffe8cc",
  },
  pantryBadge: {
    backgroundColor: "#e3f2fd",
  },
  badgeText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    paddingVertical: 10,
  },
  generateButton: {
    backgroundColor: "#ff870a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingStepText: {
    marginTop: 10,
    fontSize: 14,
    color: "#ff870a",
    fontWeight: "bold",
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  recipeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  calorieBadge: {
    backgroundColor: "#ff870a",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  calorieText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  recipeSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ff870a",
    marginTop: 10,
    marginBottom: 5,
  },
  ingredientItem: {
    fontSize: 13,
    color: "#555",
    marginBottom: 3,
    paddingLeft: 5,
  },
  instructionsText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
  saveRecipeButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  saveRecipeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyPromptContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    elevation: 2,
  },
  emptyPromptTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptyPromptSubtitle: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default AiRecipes;
