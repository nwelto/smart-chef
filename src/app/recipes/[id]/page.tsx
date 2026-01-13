"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AddToListButton } from "@/components/AddToListButton";
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

  async function handleToggleFavorite() {
    if (!recipe) return;
    const res = await fetch(`/api/recipes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !recipe.is_favorite }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRecipe(updated);
    }
  }

  async function handleToggleFamilyFavorite() {
    if (!recipe) return;
    const res = await fetch(`/api/recipes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_family_favorite: !recipe.is_family_favorite }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRecipe(updated);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar userEmail={userEmail} />
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 text-center">
          <p className="text-muted uppercase tracking-wider text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar userEmail={userEmail} />
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 text-center">
          <p className="text-muted mb-6">Recipe not found</p>
          <Link href="/recipes" className="btn-primary">
            Back to Recipes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        <Link 
          href="/recipes" 
          className="inline-block mb-6 sm:mb-8 text-xs sm:text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
        >
          ← Back to recipes
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <p className="label text-xs sm:text-sm mb-2">Recipe</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black break-words">{recipe.title}</h1>
              {recipe.is_favorite && <span className="text-accent text-xl sm:text-2xl">★</span>}
              {recipe.is_family_favorite && <span className="text-red-500 text-xl sm:text-2xl">♥</span>}
            </div>
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

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button
            onClick={handleToggleFavorite}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              recipe.is_favorite
                ? "bg-accent text-white border-accent"
                : "bg-transparent text-foreground border-border hover:border-accent"
            }`}
          >
            {recipe.is_favorite ? "★ Favorited" : "☆ Favorite"}
          </button>
          <button
            onClick={handleToggleFamilyFavorite}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              recipe.is_family_favorite
                ? "bg-red-500 text-white border-red-500"
                : "bg-transparent text-foreground border-border hover:border-red-500"
            }`}
          >
            {recipe.is_family_favorite ? "♥ Family" : "♡ Family"}
          </button>
          <AddToListButton
            items={(recipe.ingredients || []).map(ing => ({
              item: ing.item,
              amount: ing.amount,
              category: "Other",
            }))}
            sourceId={recipe.id}
            sourceType="recipe"
            className="text-[10px] sm:text-xs"
          />
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

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Ingredients</h2>
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
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Instructions</h2>
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

        {recipe.spices_used && recipe.spices_used.length > 0 && (
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Spices Used</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.spices_used.map((spice, index) => (
                <span key={index} className="tag text-xs sm:text-sm">
                  {spice}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm text-muted">
            Saved on {new Date(recipe.created_at).toLocaleDateString()}
          </span>
          <button 
            onClick={handleDelete} 
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors self-start sm:self-auto"
          >
            Delete Recipe
          </button>
        </div>
      </div>
    </main>
  );
}
