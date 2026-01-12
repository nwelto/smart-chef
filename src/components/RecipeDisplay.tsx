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
    <div className="card">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold">{recipe.title}</h2>
          <p className="text-muted mt-1">{recipe.description}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            recipe.difficulty === "easy"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : recipe.difficulty === "medium"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {recipe.difficulty}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-muted">Prep:</span>
          <span className="font-medium">{recipe.prep_time_minutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted">Cook:</span>
          <span className="font-medium">{recipe.cook_time_minutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted">Servings:</span>
          <span className="font-medium">{recipe.servings}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-3">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-medium text-primary">{ing.amount}</span>
                <span>
                  {ing.item}
                  {ing.note && <span className="text-muted"> ({ing.note})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Instructions</h3>
          <ol className="space-y-3">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.tips && (
        <div className="mt-6 p-4 bg-accent rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Chef&apos;s Tip:</span> {recipe.tips}
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-6 pt-6 border-t border-border">
        {onSave && !saved && (
          <button onClick={onSave} className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Recipe"}
          </button>
        )}
        {saved && (
          <span className="text-green-600 dark:text-green-400 font-medium py-2">
            ✓ Recipe saved
          </span>
        )}
        {onNewRecipe && (
          <button onClick={onNewRecipe} className="btn-secondary">
            Generate Another
          </button>
        )}
      </div>
    </div>
  );
}
