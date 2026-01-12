"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/lib/types";

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      const res = await fetch(`/api/recipes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRecipe(data);
      }
      setLoading(false);
    }
    loadData();
  }, [id, supabase.auth]);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this recipe?");
    if (!confirmed) return;

    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/recipes");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar userEmail={userEmail} />
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-muted">
          Loading...
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen">
        <Navbar userEmail={userEmail} />
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-muted mb-4">Recipe not found</p>
          <Link href="/recipes" className="btn-primary">
            Back to Recipes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar userEmail={userEmail} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/recipes" className="text-sm text-muted hover:text-primary mb-6 inline-block">
          ← Back to recipes
        </Link>

        <div className="card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">{recipe.title}</h1>
              <p className="text-muted mt-2">{recipe.description}</p>
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
              <h2 className="font-semibold mb-3">Ingredients</h2>
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
              <h2 className="font-semibold mb-3">Instructions</h2>
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

          {recipe.spices_used && recipe.spices_used.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h2 className="font-semibold mb-2">Spices Used</h2>
              <div className="flex flex-wrap gap-2">
                {recipe.spices_used.map((spice, index) => (
                  <span key={index} className="tag">
                    {spice}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted">
              Saved on {new Date(recipe.created_at).toLocaleDateString()}
            </span>
            <button onClick={handleDelete} className="text-sm text-red-500 hover:underline">
              Delete Recipe
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
