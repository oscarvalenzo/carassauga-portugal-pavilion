import { useState, useEffect, useCallback } from 'react';
import { recipeAPI } from '../services/api';

export interface Recipe {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  prepTime: string;
  description: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  savedAt?: string;
  savedId?: number;
}

interface UseRecipesReturn {
  recipes: Recipe[];
  savedRecipes: Recipe[];
  loading: boolean;
  error: string | null;
  saveRecipe: (recipeName: string) => Promise<boolean>;
  unsaveRecipe: (savedId: number) => Promise<boolean>;
  isRecipeSaved: (recipeName: string) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing recipes
 */
export const useRecipes = (): UseRecipesReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const [allRecipesResponse, savedRecipesResponse] = await Promise.all([
        recipeAPI.getAll(),
        recipeAPI.getSaved(),
      ]);

      // Ensure we always have arrays
      const allRecipesData = allRecipesResponse.data.recipes || [];
      const savedRecipesData = savedRecipesResponse.data.recipes || [];
      
      setRecipes(Array.isArray(allRecipesData) ? allRecipesData : []);
      setSavedRecipes(Array.isArray(savedRecipesData) ? savedRecipesData : []);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError(err.response?.data?.error || 'Failed to load recipes');
      
      // Set mock data as fallback
      setRecipes([
        {
          id: 1,
          name: 'Bacalhau à Brás',
          category: 'Main Dish',
          difficulty: 'Medium',
          prepTime: '30 min',
          description: 'Classic Portuguese codfish dish with onions, eggs, and matchstick potatoes',
          image: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&q=80',
          ingredients: ['500g salted cod', '4 eggs', '300g potatoes', '2 onions', 'olive oil', 'black olives', 'parsley'],
          instructions: ['Soak the salted cod overnight', 'Shred the cod into small pieces', 'Fry potatoes until golden']
        },
        {
          id: 2,
          name: 'Pastéis de Nata',
          category: 'Dessert',
          difficulty: 'Easy',
          prepTime: '45 min',
          description: 'Traditional Portuguese custard tarts with flaky pastry',
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
          ingredients: ['Puff pastry', '6 egg yolks', '300ml cream', '200g sugar'],
          instructions: ['Roll out puff pastry', 'Press into muffin tins', 'Bake at 250°C for 15-20 minutes']
        }
      ]);
      setSavedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const saveRecipe = useCallback(async (recipeName: string): Promise<boolean> => {
    try {
      const response = await recipeAPI.save(recipeName);
      
      if (response.data.success) {
        // Update saved recipes list
        setSavedRecipes(prev => [...prev, response.data.recipe]);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      return false;
    }
  }, []);

  const unsaveRecipe = useCallback(async (savedId: number): Promise<boolean> => {
    try {
      const response = await recipeAPI.unsave(savedId);
      
      if (response.data.success) {
        // Remove from saved recipes list
        setSavedRecipes(prev => prev.filter(r => r.savedId !== savedId));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error unsaving recipe:', err);
      return false;
    }
  }, []);

  const isRecipeSaved = useCallback((recipeName: string): boolean => {
    return savedRecipes.some(r => r.name === recipeName);
  }, [savedRecipes]);

  return {
    recipes: Array.isArray(recipes) ? recipes : [],
    savedRecipes: Array.isArray(savedRecipes) ? savedRecipes : [],
    loading,
    error,
    saveRecipe,
    unsaveRecipe,
    isRecipeSaved,
    refetch: fetchRecipes,
  };
};

