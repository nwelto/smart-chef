"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { Recipe, ScheduledMeal } from "@/lib/types";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_LABELS: Record<string, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  dinner: "🌙 Dinner",
  snack: "🍎 Snack",
};

function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day); // Start from Sunday

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDayLabel(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

export default function CalendarPage() {
  const [userEmail, setUserEmail] = useState<string>();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [meals, setMeals] = useState<ScheduledMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<typeof MEAL_TYPES[number]>("dinner");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [customMeal, setCustomMeal] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const weekDates = getWeekDates(currentWeek);
  const startDate = formatDateKey(weekDates[0]);
  const endDate = formatDateKey(weekDates[6]);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email);

      // Load scheduled meals for the week
      const mealsRes = await fetch(`/api/scheduled-meals?start=${startDate}&end=${endDate}`);
      if (mealsRes.ok) {
        const data = await mealsRes.json();
        setMeals(data);
      }

      // Load recipes for selection
      const recipesRes = await fetch("/api/recipes");
      if (recipesRes.ok) {
        const data = await recipesRes.json();
        setRecipes(data);
      }

      setLoading(false);
    }
    loadData();
  }, [supabase.auth, router, startDate, endDate]);

  function prevWeek() {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  }

  function goToToday() {
    setCurrentWeek(new Date());
  }

  function openAddModal(date: Date, mealType: typeof MEAL_TYPES[number]) {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setSelectedRecipeId("");
    setCustomMeal("");
    setShowAddModal(true);
  }

  async function handleAddMeal() {
    if (!selectedDate) return;
    if (!selectedRecipeId && !customMeal.trim()) return;

    const res = await fetch("/api/scheduled-meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: formatDateKey(selectedDate),
        meal_type: selectedMealType,
        recipe_id: selectedRecipeId || null,
        custom_meal: customMeal.trim() || null,
      }),
    });

    if (res.ok) {
      const newMeal = await res.json();
      setMeals([...meals, newMeal]);
      setShowAddModal(false);
    }
  }

  async function handleDeleteMeal(mealId: string) {
    const res = await fetch(`/api/scheduled-meals/${mealId}`, { method: "DELETE" });
    if (res.ok) {
      setMeals(meals.filter(m => m.id !== mealId));
    }
  }

  function getMealsForDateAndType(date: Date, mealType: string): ScheduledMeal[] {
    const dateKey = formatDateKey(date);
    return meals.filter(m => m.date === dateKey && m.meal_type === mealType);
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar userEmail={userEmail} />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-muted uppercase tracking-wider text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="label text-xs sm:text-sm mb-2">Your Week</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[0.9]">
              Meal
              <br />
              <span className="text-accent">Calendar</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="btn-secondary text-sm px-3 py-2">
              ← Prev
            </button>
            <button onClick={goToToday} className="btn-secondary text-sm px-3 py-2">
              Today
            </button>
            <button onClick={nextWeek} className="btn-secondary text-sm px-3 py-2">
              Next →
            </button>
          </div>
        </div>

        {/* Week Header */}
        <div className="mb-4 text-center">
          <p className="text-lg font-bold">
            {weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            {" - "}
            {weekDates[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day Headers */}
          {weekDates.map((date) => (
            <div
              key={formatDateKey(date)}
              className={`text-center p-2 border-b-2 ${
                isToday(date) ? "border-accent" : "border-border"
              }`}
            >
              <p className="text-xs sm:text-sm font-bold">{formatDayLabel(date)}</p>
              <p className={`text-lg sm:text-2xl font-black ${isToday(date) ? "text-accent" : ""}`}>
                {date.getDate()}
              </p>
            </div>
          ))}

          {/* Meal Slots */}
          {MEAL_TYPES.map((mealType) => (
            weekDates.map((date) => {
              const dayMeals = getMealsForDateAndType(date, mealType);
              
              return (
                <div
                  key={`${formatDateKey(date)}-${mealType}`}
                  className="min-h-[100px] sm:min-h-[120px] border border-border p-1 sm:p-2"
                >
                  <p className="text-[10px] sm:text-xs text-muted mb-1">{MEAL_LABELS[mealType]}</p>
                  
                  {dayMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-card border border-border p-1.5 mb-1 text-xs group relative"
                    >
                      <p className="font-medium truncate">
                        {meal.recipe?.title || meal.custom_meal || "Meal"}
                      </p>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => openAddModal(date, mealType)}
                    className="w-full text-xs text-muted hover:text-accent transition-colors py-1"
                  >
                    + Add
                  </button>
                </div>
              );
            })
          ))}
        </div>

        {/* Generate Shopping List */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href="/shopping" className="btn-primary">
            🛒 View Shopping List
          </Link>
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Add {MEAL_LABELS[selectedMealType]} for {selectedDate.toLocaleDateString()}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label text-xs block mb-2">Meal Type</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value as typeof MEAL_TYPES[number])}
                  className="w-full bg-background border border-border px-3 py-2 text-sm"
                >
                  {MEAL_TYPES.map(type => (
                    <option key={type} value={type}>{MEAL_LABELS[type]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-xs block mb-2">From Saved Recipes</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => { setSelectedRecipeId(e.target.value); setCustomMeal(""); }}
                  className="w-full bg-background border border-border px-3 py-2 text-sm"
                >
                  <option value="">-- Select a recipe --</option>
                  {recipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>{recipe.title}</option>
                  ))}
                </select>
              </div>

              <div className="text-center text-muted text-sm">— or —</div>

              <div>
                <label className="label text-xs block mb-2">Custom Meal</label>
                <input
                  type="text"
                  value={customMeal}
                  onChange={(e) => { setCustomMeal(e.target.value); setSelectedRecipeId(""); }}
                  placeholder="e.g., Leftover pasta"
                  className="w-full bg-transparent border border-border px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleAddMeal} className="btn-primary flex-1">
                  Add Meal
                </button>
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
