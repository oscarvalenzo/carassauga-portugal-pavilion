import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';
import { Request, Response } from 'express';

export const recipeRouter = Router();

recipeRouter.use(authMiddleware);

// Static recipe data (can be moved to database later)
const RECIPES = [
  {
    id: 1,
    name: 'Bacalhau à Brás',
    category: 'Main Course',
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&q=80',
    description: 'Traditional Portuguese codfish dish with eggs and potatoes',
    ingredients: ['Salted cod', 'Potatoes', 'Eggs', 'Onions', 'Olive oil', 'Parsley'],
    instructions: [
      'Soak salted cod in water for 24 hours',
      'Shred the cod and sauté with onions',
      'Add matchstick potatoes',
      'Stir in beaten eggs until creamy',
      'Garnish with parsley and black olives'
    ]
  },
  {
    id: 2,
    name: 'Pastéis de Nata',
    category: 'Dessert',
    difficulty: 'Hard',
    image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&q=80',
    description: 'Portuguese custard tarts with flaky pastry',
    ingredients: ['Puff pastry', 'Egg yolks', 'Sugar', 'Milk', 'Vanilla', 'Cinnamon'],
    instructions: [
      'Line muffin tins with puff pastry',
      'Heat milk with sugar and vanilla',
      'Whisk in egg yolks',
      'Pour custard into pastry shells',
      'Bake at high heat until caramelized'
    ]
  },
  {
    id: 3,
    name: 'Caldo Verde',
    category: 'Soup',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    description: 'Traditional Portuguese kale soup',
    ingredients: ['Kale', 'Potatoes', 'Chorizo', 'Olive oil', 'Garlic', 'Salt'],
    instructions: [
      'Boil potatoes until soft',
      'Mash potatoes in the broth',
      'Add finely sliced kale',
      'Add sliced chorizo',
      'Simmer for 5 minutes and drizzle with olive oil'
    ]
  },
  {
    id: 4,
    name: 'Arroz de Marisco',
    category: 'Main Course',
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400&q=80',
    description: 'Portuguese seafood rice',
    ingredients: ['Rice', 'Shrimp', 'Clams', 'Mussels', 'Tomatoes', 'White wine', 'Cilantro'],
    instructions: [
      'Sauté seafood with garlic and olive oil',
      'Add tomatoes and white wine',
      'Add rice and seafood stock',
      'Cook until rice is tender',
      'Garnish with fresh cilantro'
    ]
  },
  {
    id: 5,
    name: 'Francesinha',
    category: 'Main Course',
    difficulty: 'Hard',
    image: 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=400&q=80',
    description: 'Porto-style sandwich with melted cheese and beer sauce',
    ingredients: ['Bread', 'Steak', 'Ham', 'Sausage', 'Cheese', 'Beer', 'Tomato sauce'],
    instructions: [
      'Layer meats between bread slices',
      'Cover with melted cheese',
      'Prepare beer and tomato sauce',
      'Pour sauce over sandwich',
      'Serve with french fries'
    ]
  }
];

// GET /api/recipes - Get all recipes
recipeRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  // Get saved recipe IDs for this user
  const savedResult = await query(
    'SELECT recipe_name FROM user_recipes WHERE user_id = $1',
    [userId]
  );
  
  const savedRecipeNames = savedResult.rows.map((r: any) => r.recipe_name);
  
  // Add saved status to recipes
  const recipesWithStatus = RECIPES.map(recipe => ({
    ...recipe,
    is_saved: savedRecipeNames.includes(recipe.name)
  }));
  
  res.json({ success: true, recipes: recipesWithStatus });
}));

// GET /api/recipes/saved - Get user's saved recipes
recipeRouter.get('/saved', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  const result = await query(
    'SELECT id, recipe_name, saved_at FROM user_recipes WHERE user_id = $1 ORDER BY saved_at DESC',
    [userId]
  );
  
  // Match saved recipes with full recipe data
  const savedRecipes = result.rows.map((saved: any) => {
    const recipe = RECIPES.find(r => r.name === saved.recipe_name);
    return recipe ? {
      ...recipe,
      savedId: saved.id,
      saved_at: saved.saved_at
    } : null;
  }).filter(r => r !== null);
  
  res.json({ success: true, recipes: savedRecipes });
}));

// POST /api/recipes/save - Save a recipe
recipeRouter.post('/save', asyncHandler(async (req: Request, res: Response) => {
  const { recipe_name } = req.body;
  const userId = req.userId;
  
  if (!recipe_name) {
    res.status(400).json({ error: 'Recipe name is required' });
    return;
  }
  
  // Check if recipe exists in static data
  const recipe = RECIPES.find(r => r.name === recipe_name);
  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }
  
  // Check if already saved
  const existingResult = await query(
    'SELECT * FROM user_recipes WHERE user_id = $1 AND recipe_name = $2',
    [userId, recipe_name]
  );
  
  if (existingResult.rows.length > 0) {
    res.status(400).json({ error: 'Recipe already saved' });
    return;
  }
  
  // Save recipe
  const result = await query(
    'INSERT INTO user_recipes (user_id, recipe_name) VALUES ($1, $2) RETURNING *',
    [userId, recipe_name]
  );
  
  res.json({
    success: true,
    message: 'Recipe saved successfully!',
    recipe: {
      ...recipe,
      savedId: result.rows[0].id,
      saved_at: result.rows[0].saved_at
    }
  });
}));

// DELETE /api/recipes/unsave/:recipeId - Unsave a recipe
recipeRouter.delete('/unsave/:recipeId', asyncHandler(async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const userId = req.userId;
  
  // Verify ownership and delete
  const result = await query(
    'DELETE FROM user_recipes WHERE id = $1 AND user_id = $2 RETURNING *',
    [recipeId, userId]
  );
  
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Saved recipe not found' });
    return;
  }
  
  res.json({
    success: true,
    message: 'Recipe removed from saved list'
  });
}));

export default recipeRouter;

