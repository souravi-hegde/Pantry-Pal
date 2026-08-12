import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChefHat, X, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RecipeDetailModal } from "@/components/RecipeDetailModal";

export default function Recipes() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);

  // Fetch initial ingredients from pantry on page load
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch('http://localhost:3001/api/items', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Extract just the item names from the response
          const itemNames = data.map((item: any) => item.name);
          setIngredients(itemNames);
        }
        setIsLoadingIngredients(false);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        setIsLoadingIngredients(false);
      }
    };

    fetchIngredients();
  }, [navigate]);

  // Add a new ingredient manually
  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  // Remove an ingredient
  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  // Find recipes based on selected ingredients
  const handleFindRecipes = async () => {
    try {
      if (ingredients.length === 0) {
        alert('Please select at least one ingredient');
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch('http://localhost:3001/api/recipes/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ingredients: ingredients
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Extract the recipes array from the response object
        // Backend returns { recipes: [...] } or just the array directly
        const recipesArray = Array.isArray(data) ? data : (data.recipes || []);
        setRecipes(recipesArray);
      } else {
        const errorData = await response.json();
        alert(`Failed to find recipes: ${errorData.message || 'Unknown error'}`);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error finding recipes:', error);
      alert('Failed to find recipes: Unable to connect to server');
      setIsLoading(false);
    }
  };

  if (isLoadingIngredients) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading your pantry items...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Recipes to Reduce Waste ✨</h1>
          <p className="text-muted-foreground">Get recipe suggestions using ingredients from your pantry</p>
        </div>

        <Card className="p-6 rounded-3xl shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Ingredients</h2>
          
          {/* Display selected ingredients */}
          <div className="flex flex-wrap gap-3 mb-6">
            {ingredients.length === 0 ? (
              <p className="text-muted-foreground">No ingredients selected. Add some below!</p>
            ) : (
              ingredients.map((ingredient) => (
                <Badge key={ingredient} className="px-4 py-2 rounded-2xl bg-secondary text-secondary-foreground text-sm">
                  {ingredient}
                  <button onClick={() => removeIngredient(ingredient)} className="ml-2 hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          {/* Add ingredient input */}
          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Add another ingredient..."
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
              className="h-12 rounded-2xl"
            />
            <Button 
              onClick={addIngredient}
              className="h-12 px-6 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Add
            </Button>
          </div>

          {/* Find Recipes Button */}
          <Button 
            onClick={handleFindRecipes}
            disabled={isLoading || ingredients.length === 0}
            className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" strokeWidth={1.5} />
                Finding Recipes...
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Find Recipes
              </>
            )}
          </Button>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Searching for delicious recipes...</p>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {recipes.length > 0 && !isLoading && (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Found {recipes.length} Recipes
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <Card key={index} className="rounded-3xl shadow-card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                    {recipe.usedIngredients && (
                      <Badge className="absolute top-4 right-4 bg-success text-success-foreground rounded-xl px-3 py-1">
                        {recipe.usedIngredients.length} ingredients
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">{recipe.title}</h3>
                    
                    {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground font-medium">Your Ingredients:</p>
                        <div className="flex flex-wrap gap-2">
                          {recipe.usedIngredients.slice(0, 3).map((ing: any) => (
                            <span 
                              key={ing.name} 
                              className="text-sm text-foreground bg-success/20 px-2 py-1 rounded-lg"
                            >
                              {ing.name}
                            </span>
                          ))}
                          {recipe.usedIngredients.length > 3 && (
                            <span className="text-sm text-muted-foreground">
                              +{recipe.usedIngredients.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => setSelectedRecipe(recipe)}
                        className="flex-1 h-10 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        View Recipe
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recipes.length === 0 && ingredients.length > 0 && (
          <Card className="p-12 rounded-3xl shadow-card text-center">
            <p className="text-muted-foreground text-lg">
              Click "Find Recipes" to discover delicious recipes using your ingredients!
            </p>
          </Card>
        )}
      </div>

      {selectedRecipe && (
        <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </AppLayout>
  );
}
