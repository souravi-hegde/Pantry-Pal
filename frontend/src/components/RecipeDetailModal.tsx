import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader } from "lucide-react";

export function RecipeDetailModal({ recipe, onClose }: { recipe: any, onClose: () => void }) {
  // State for loading the link
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [error, setError] = useState("");

  // This is the new function we are adding
  const handleViewFullRecipe = async () => {
    setIsLoadingLink(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found, please log in again.');
      }

      // Call the new backend endpoint we created
      const res = await fetch(`http://localhost:3001/api/recipes/link/${recipe.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch recipe link from backend');
      }

      const data = await res.json();
      const recipeUrl = data.url;

      // Open the URL in a new tab
      if (recipeUrl) {
        window.open(recipeUrl, '_blank');
      } else {
        setError('Sorry, no recipe link is available for this item.');
      }
    } catch (err: unknown) { // <-- This is the fix
      console.error(err);
      
      // This is a safer way to get the error message
      let errorMessage = 'An error occurred. Could not get recipe link.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoadingLink(false);
    }
  };

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="bg-card text-card-foreground p-6 rounded-3xl shadow-lg w-full max-w-lg mx-4 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 rounded-full" 
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
        
        <h2 className="text-2xl font-bold text-foreground mb-4">{recipe.title}</h2>
        
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-64 object-cover rounded-2xl mb-4" 
        />

        <h3 className="text-lg font-semibold text-foreground mb-2">Your Ingredients:</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.usedIngredients?.map((ing: any) => (
            <Badge key={ing.id} variant="secondary">
              {ing.name}
            </Badge>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">Missing Ingredients:</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.missedIngredients?.map((ing: any) => (
            <Badge key={ing.id} variant="destructive">
              {ing.name}
            </Badge>
          ))}
        </div>

        {/* This will show an error if one occurs */}
        {error && <p className="text-destructive text-sm mb-4">{error}</p>}

        <div className="flex flex-col gap-3">
          {/* This button is now fixed */}
          <Button 
            onClick={handleViewFullRecipe} 
            disabled={isLoadingLink}
            className="h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoadingLink ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              "View Full Recipe on Spoonacular"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="h-12 rounded-2xl"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}