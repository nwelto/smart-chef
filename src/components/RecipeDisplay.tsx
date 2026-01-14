"use client";

import type { GenerateRecipeResponse } from "@/lib/types";

interface RecipeDisplayProps {
  recipe: GenerateRecipeResponse;
  onSave?: () => void;
  onNewRecipe?: () => void;
  saving?: boolean;
  saved?: boolean;
}

export function RecipeDisplay({ recipe, onSave, onNewRecipe, saving, saved }: RecipeDisplayProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <p className="label text-xs sm:text-sm mb-2">Your Recipe</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black break-words">{recipe.title}</h2>
          <p className="text-muted text-sm sm:text-base mt-2 max-w-2xl">{recipe.description}</p>
        </div>
        <span
          className={`self-start shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
            recipe.difficulty === "easy"
              ? "bg-green-500 text-white"
              : recipe.difficulty === "medium"
              ? "bg-yellow-500 text-black"
              : "bg-red-500 text-white"
          }`}
        >
          {recipe.difficulty}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 mb-8 sm:mb-12 py-4 sm:py-6 border-y border-border">
        <div>
          <p className="label text-[10px] sm:text-xs mb-1">Prep Time</p>
          <p className="text-lg sm:text-2xl font-bold">{recipe.prep_time_minutes} min</p>
        </div>
        <div>
          <p className="label text-[10px] sm:text-xs mb-1">Cook Time</p>
          <p className="text-lg sm:text-2xl font-bold">{recipe.cook_time_minutes} min</p>
        </div>
        <div>
          <p className="label text-[10px] sm:text-xs mb-1">Total</p>
          <p className="text-lg sm:text-2xl font-bold">{recipe.prep_time_minutes + recipe.cook_time_minutes} min</p>
        </div>
        <div>
          <p className="label text-[10px] sm:text-xs mb-1">Servings</p>
          <p className="text-lg sm:text-2xl font-bold">{recipe.servings}</p>
        </div>
      </div>

      {/* Macros */}
      {recipe.macros_per_serving && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-12 p-4 sm:p-6 bg-card border border-border">
          <div className="text-center">
            <p className="text-xl sm:text-3xl font-black text-accent">{recipe.macros_per_serving.calories}</p>
            <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider">Calories</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-3xl font-black">{recipe.macros_per_serving.protein_g}g</p>
            <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-3xl font-black">{recipe.macros_per_serving.carbs_g}g</p>
            <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider">Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-3xl font-black">{recipe.macros_per_serving.fat_g}g</p>
            <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider">Fat</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Ingredients</h3>
          <ul className="space-y-3 sm:space-y-4">
            {(recipe.ingredients || []).map((ing, index) => (
              <li key={index} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border text-sm sm:text-base">
                <span className="font-bold text-accent shrink-0 w-16 sm:w-24">{ing.amount}</span>
                <span>
                  {ing.item}
                  {ing.note && <span className="text-muted"> ({ing.note})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Instructions</h3>
          <ol className="space-y-4 sm:space-y-6">
            {(recipe.instructions || []).map((step, index) => (
              <li key={index} className="flex gap-3 sm:gap-4">
                <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-foreground text-background text-sm sm:text-base font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="pt-1 sm:pt-2 text-sm sm:text-base">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Grocery List */}
      {recipe.grocery_list && recipe.grocery_list.length > 0 && (
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Grocery List</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {recipe.grocery_list.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm sm:text-base">
                <span className="w-4 h-4 border-2 border-border shrink-0"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
        {onSave && !saved && (
          <button onClick={onSave} className="btn-primary text-sm sm:text-base" disabled={saving}>
            {saving ? "Saving..." : "Save Recipe"}
          </button>
        )}
        {saved && (
          <span className="text-green-600 font-bold uppercase tracking-wider text-xs sm:text-sm py-3 sm:py-4">
            ✓ Recipe saved
          </span>
        )}
        {onNewRecipe && (
          <button onClick={onNewRecipe} className="btn-secondary text-sm sm:text-base">
            Generate Another
          </button>
        )}
      </div>
    </div>
  );
}
