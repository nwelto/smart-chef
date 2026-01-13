"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AddToListButton } from "@/components/AddToListButton";
import { createClient } from "@/lib/supabase/client";

interface MealIngredient {
  item: string;
  amount: string;
}

interface Meal {
  name: string;
  description: string;
  prep_time_minutes: number;
  cook_time_minutes?: number;
  servings?: number;
  ingredients?: MealIngredient[];
  instructions?: string[];
  macros: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
}

interface MealPlanData {
  days: {
    day: string;
    meals: Meal[];
  }[];
  grocery_list: { category: string; items: string[] }[];
  prep_instructions: string[];
  storage_tips: string[];
}

interface MealPlan {
  id: string;
  title: string;
  description: string;
  plan_type: string;
  people: number;
  days: number;
  meals_per_day: number;
  total_prep_time_hours: number;
  plan_data: MealPlanData;
  created_at: string;
}

export default function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>();
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  function toggleMeal(mealKey: string) {
    setExpandedMeals(prev => {
      const next = new Set(prev);
      if (next.has(mealKey)) {
        next.delete(mealKey);
      } else {
        next.add(mealKey);
      }
      return next;
    });
  }

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      const res = await fetch(`/api/meal-plans/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
      setLoading(false);
    }
    loadData();
  }, [id, supabase.auth]);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this meal plan?");
    if (!confirmed) return;

    const res = await fetch(`/api/meal-plans/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/meal-plans");
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

  if (!plan) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar userEmail={userEmail} />
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 text-center">
          <p className="text-muted mb-6">Meal plan not found</p>
          <Link href="/meal-plans" className="btn-primary">
            Back to Meal Plans
          </Link>
        </div>
      </main>
    );
  }

  const data = plan.plan_data;

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        <Link 
          href="/meal-plans" 
          className="inline-block mb-6 sm:mb-8 text-xs sm:text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors"
        >
          ← Back to Meal Plans
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
            {plan.title}
          </h1>
          <p className="text-muted">{plan.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <span className="text-muted"><strong className="text-foreground">{plan.people}</strong> people</span>
            <span className="text-muted"><strong className="text-foreground">{plan.days}</strong> days</span>
            <span className="text-accent font-bold">~{plan.total_prep_time_hours}h prep</span>
          </div>
        </div>

        {/* Grocery List */}
        <div className="mb-12 p-6 bg-card border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">🛒 Grocery List</h2>
            <AddToListButton
              items={(data.grocery_list || []).flatMap(cat =>
                cat.items.map(item => ({
                  item: item,
                  amount: "1",
                  category: cat.category,
                }))
              )}
              sourceId={plan.id}
              sourceType="meal_plan"
            />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(data.grocery_list || []).map((cat) => (
              <div key={cat.category}>
                <p className="font-bold text-accent mb-2">{cat.category}</p>
                <ul className="space-y-1">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 border-2 border-border shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Meals */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">📅 Your Meal Plan</h2>
          <div className="space-y-6">
            {(data.days || []).map((day, dayIndex) => (
              <div key={day.day} className="border border-border p-4 sm:p-6">
                <h3 className="font-bold text-lg mb-4">{day.day}</h3>
                <div className="space-y-4">
                  {day.meals.map((meal, mealIndex) => {
                    const mealKey = `${dayIndex}-${mealIndex}`;
                    const isExpanded = expandedMeals.has(mealKey);
                    const hasRecipe = meal.ingredients && meal.ingredients.length > 0;

                    return (
                      <div key={mealIndex} className="border border-border/50">
                        {/* Meal Header */}
                        <button
                          onClick={() => hasRecipe && toggleMeal(mealKey)}
                          className={`w-full text-left p-4 ${hasRecipe ? "cursor-pointer hover:bg-card/50" : ""}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold">{meal.name}</p>
                                {hasRecipe && (
                                  <span className="text-xs text-accent">
                                    {isExpanded ? "▼" : "▶"} Recipe
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted">{meal.description}</p>
                              <p className="text-xs text-muted mt-1">
                                Prep: {meal.prep_time_minutes} min
                                {meal.cook_time_minutes && ` • Cook: ${meal.cook_time_minutes} min`}
                                {meal.servings && ` • ${meal.servings} servings`}
                              </p>
                            </div>
                            <div className="flex gap-4 text-xs text-center">
                              <div>
                                <p className="font-bold text-accent">{meal.macros?.calories || 0}</p>
                                <p className="text-muted">cal</p>
                              </div>
                              <div>
                                <p className="font-bold">{meal.macros?.protein_g || 0}g</p>
                                <p className="text-muted">protein</p>
                              </div>
                              <div>
                                <p className="font-bold">{meal.macros?.carbs_g || 0}g</p>
                                <p className="text-muted">carbs</p>
                              </div>
                              <div>
                                <p className="font-bold">{meal.macros?.fat_g || 0}g</p>
                                <p className="text-muted">fat</p>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Expanded Recipe */}
                        {isExpanded && hasRecipe && (
                          <div className="border-t border-border/50 p-4 bg-card/30">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Ingredients */}
                              <div>
                                <h4 className="font-bold mb-3">Ingredients</h4>
                                <ul className="space-y-1">
                                  {(meal.ingredients || []).map((ing, i) => (
                                    <li key={i} className="text-sm flex gap-2">
                                      <span className="text-accent font-medium">{ing.amount}</span>
                                      <span>{ing.item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Instructions */}
                              {meal.instructions && meal.instructions.length > 0 && (
                                <div>
                                  <h4 className="font-bold mb-3">Instructions</h4>
                                  <ol className="space-y-2">
                                    {meal.instructions.map((step, i) => (
                                      <li key={i} className="text-sm flex gap-3">
                                        <span className="w-5 h-5 bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0">
                                          {i + 1}
                                        </span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prep Instructions */}
        {data.prep_instructions && data.prep_instructions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">👨‍🍳 Prep Instructions</h2>
            <ol className="space-y-3">
              {data.prep_instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-8 h-8 bg-foreground text-background font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Storage Tips */}
        {data.storage_tips && data.storage_tips.length > 0 && (
          <div className="mb-12 p-6 bg-card border border-border">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">💡 Storage Tips</h2>
            <ul className="space-y-2">
              {data.storage_tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-accent">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center pt-8 border-t border-border">
          <span className="text-xs sm:text-sm text-muted">
            Created {new Date(plan.created_at).toLocaleDateString()}
          </span>
          <button 
            onClick={handleDelete} 
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors"
          >
            Delete Plan
          </button>
        </div>
      </div>
    </main>
  );
}
