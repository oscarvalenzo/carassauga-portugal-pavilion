import { Request, Response } from 'express';
import { query } from '../config/database';

// Portuguese recipes data
const RECIPES = [
  {
    id: 1,
    name: 'Bacalhau à Brás',
    category: 'Main Dish',
    difficulty: 'Medium',
    prepTime: '30 min',
    description: 'Classic Portuguese codfish dish with onions, eggs, and matchstick potatoes',
    image: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&q=80',
    ingredients: ['500g salted cod', '4 eggs', '300g potatoes', '2 onions', 'olive oil', 'black olives', 'parsley'],
    instructions: [
      'Soak the salted cod overnight to remove excess salt',
      'Shred the cod into small pieces',
      'Cut potatoes into matchsticks and fry until golden',
      'Sauté onions until translucent',
      'Combine cod, onions, and potatoes',
      'Add beaten eggs and stir gently',
      'Garnish with olives and parsley'
    ]
  },
  {
    id: 2,
    name: 'Pastéis de Nata',
    category: 'Dessert',
    difficulty: 'Easy',
    prepTime: '45 min',
    description: 'Traditional Portuguese custard tarts with flaky pastry',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    ingredients: ['Puff pastry', '6 egg yolks', '300ml cream', '200g sugar', '1 cinnamon stick', 'lemon zest'],
    instructions: [
      'Roll out puff pastry and cut into circles',
      'Press pastry into muffin tins',
      'Heat cream, sugar, cinnamon, and lemon zest',
      'Whisk egg yolks and combine with cream mixture',
      'Pour custard into pastry shells',
      'Bake at 250°C for 15-20 minutes until tops are caramelized',
      'Cool and dust with cinnamon'
    ]
  },
  {
    id: 3,
    name: 'Caldo Verde',
    category: 'Soup',
    difficulty: 'Easy',
    prepTime: '40 min',
    description: 'Traditional Portuguese green soup with kale and chorizo',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    ingredients: ['500g potatoes', '300g kale', '200g chorizo', '1 onion', 'olive oil', 'garlic', 'salt', 'pepper'],
    instructions: [
      'Boil potatoes until soft',
      'Blend potatoes with cooking water until smooth',
      'Slice kale into thin strips',
      'Slice chorizo',
      'Add kale and chorizo to potato soup',
      'Simmer for 10 minutes',
      'Drizzle with olive oil before serving'
    ]
  },
  {
    id: 4,
    name: 'Arroz de Marisco',
    category: 'Main Dish',
    difficulty: 'Hard',
    prepTime: '60 min',
    description: 'Portuguese seafood rice with shrimp, clams, and mussels',
    image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400&q=80',
    ingredients: ['300g rice', '500g mixed seafood', '2 tomatoes', '1 onion', 'garlic', 'white wine', 'fish stock', 'coriander'],
    instructions: [
      'Sauté onion and garlic',
      'Add diced tomatoes and cook until soft',
      'Add seafood and white wine',
      'Add rice and fish stock',
      'Cook until rice is tender',
      'Garnish with fresh coriander'
    ]
  },
  {
    id: 5,
    name: 'Bifanas',
    category: 'Sandwich',
    difficulty: 'Easy',
    prepTime: '20 min',
    description: 'Portuguese pork sandwich with garlic and white wine marinade',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80',
    ingredients: ['500g pork loin', '4 crusty rolls', 'garlic', 'white wine', 'bay leaves', 'paprika', 'olive oil'],
    instructions: [
      'Marinate pork in garlic, wine, and spices',
      'Fry pork slices until cooked',
      'Slice rolls and fill with pork',
      'Spoon marinade sauce over meat',
      'Serve hot with mustard'
    ]
  },
  {
    id: 6,
    name: 'Francesinha',
    category: 'Main Dish',
    difficulty: 'Medium',
    prepTime: '45 min',
    description: 'Porto-style sandwich with meats, melted cheese, and beer sauce',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80',
    ingredients: ['Bread', 'ham', 'sausage', 'steak', 'cheese', 'beer', 'tomato sauce', 'piri-piri', 'egg'],
    instructions: [
      'Layer bread with ham, sausage, and steak',
      'Top with fried egg',
      'Cover with cheese slices',
      'Prepare beer and tomato sauce',
      'Pour sauce over sandwich',
      'Melt cheese under grill',
      'Serve with fries'
    ]
  }
];

export const recipeController = {
  /**
   * Get all available recipes
   */
  getAllRecipes: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        recipes: RECIPES,
        total: RECIPES.length
      });
    } catch (error) {
      console.error('Error getting recipes:', error);
      res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  },

  /**
   * Get user's saved recipes
   */
  getSavedRecipes: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      const result = await query(
        'SELECT recipe_name, saved_at, id FROM user_recipes WHERE user_id = $1 ORDER BY saved_at DESC',
        [userId]
      );

      // Match saved recipe names with full recipe data
      const savedRecipes = result.rows.map((row: any) => {
        const recipe = RECIPES.find(r => r.name === row.recipe_name);
        return recipe ? { ...recipe, savedAt: row.saved_at, savedId: row.id } : null;
      }).filter(Boolean);

      res.json({
        success: true,
        recipes: savedRecipes,
        total: savedRecipes.length
      });
    } catch (error) {
      console.error('Error getting saved recipes:', error);
      res.status(500).json({ error: 'Failed to fetch saved recipes' });
    }
  },

  /**
   * Save a recipe
   */
  saveRecipe: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { recipe_name } = req.body;

      if (!recipe_name) {
        return res.status(400).json({ error: 'Recipe name is required' });
      }

      // Check if recipe exists in our list
      const recipe = RECIPES.find(r => r.name === recipe_name);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Check if already saved
      const existing = await query(
        'SELECT id FROM user_recipes WHERE user_id = $1 AND recipe_name = $2',
        [userId, recipe_name]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Recipe already saved' });
      }

      // Save recipe
      const result = await query(
        'INSERT INTO user_recipes (user_id, recipe_name) VALUES ($1, $2) RETURNING id, saved_at',
        [userId, recipe_name]
      );

      res.json({
        success: true,
        message: 'Recipe saved successfully',
        recipe: {
          ...recipe,
          savedAt: result.rows[0].saved_at,
          savedId: result.rows[0].id
        }
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      res.status(500).json({ error: 'Failed to save recipe' });
    }
  },

  /**
   * Unsave a recipe
   */
  unsaveRecipe: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { recipeId } = req.params;

      const result = await query(
        'DELETE FROM user_recipes WHERE id = $1 AND user_id = $2 RETURNING id',
        [recipeId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Saved recipe not found' });
      }

      res.json({
        success: true,
        message: 'Recipe removed from saved list'
      });
    } catch (error) {
      console.error('Error unsaving recipe:', error);
      res.status(500).json({ error: 'Failed to unsave recipe' });
    }
  }
};

