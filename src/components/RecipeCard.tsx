import Link from "next/link";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (id: string) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

  return (
    <div className="card group">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/recipes/${recipe.id}`} className="flex-1">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted mt-1 line-clamp-2">
            {recipe.description}
          </p>
        </Link>
        <span
          className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
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

      <div className="flex items-center gap-4 mt-4 text-sm text-muted">
        <span>{totalTime} min total</span>
        <span>{recipe.servings} servings</span>
        <span>{recipe.ingredients_input.length} ingredients</span>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted">
          {new Date(recipe.created_at).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-sm text-primary hover:underline"
          >
            View
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
