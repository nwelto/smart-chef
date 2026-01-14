"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

const PLAN_TYPES = [
  { 
    id: "weekly-plan", 
    label: "Weekly Meal Plan", 
    desc: "Plan your meals for the week and cook fresh each day", 
    details: "Great for: Families who like variety and fresh-cooked meals"
  },
  { 
    id: "weekly-prep", 
    label: "Weekly Meal Prep", 
    desc: "Prep everything in one day, grab and reheat all week", 
    details: "Great for: Busy people who want grab-and-go convenience"
  },
];

const PROTEIN_OPTIONS = [
  "Chicken", "Beef", "Pork", "Turkey", "Fish", "Shrimp", "Tofu", "Beans/Legumes", "Eggs", "No Preference"
];

const DIETARY_OPTIONS = [
  "Gluten-Free", "Dairy-Free", "Egg-Free", "Nut-Free", "Vegetarian", "Vegan", "Keto", "Low-Carb", "Low-Sodium"
];

// Conflict detection: protein → incompatible dietary restrictions
const PROTEIN_CONFLICTS: Record<string, string[]> = {
  "Eggs": ["Egg-Free", "Vegan"],
  "Chicken": ["Vegetarian", "Vegan"],
  "Beef": ["Vegetarian", "Vegan"],
  "Pork": ["Vegetarian", "Vegan"],
  "Turkey": ["Vegetarian", "Vegan"],
  "Fish": ["Vegetarian", "Vegan"],
  "Shrimp": ["Vegetarian", "Vegan"],
};

interface MealIngredient {
  item: string;
  amount: string;
}

interface Meal {
  name: string;
  description: string;
  prep_time_minutes: number;
  cook_time_minutes?: number;
  adult_servings?: number;
  child_servings?: number;
  ingredients?: MealIngredient[];
  instructions?: string[];
  macros?: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
  macros_per_adult_serving?: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
}

interface MealPlanResult {
  title: string;
  description: string;
  days: {
    day: string;
    meals: Meal[];
  }[];
  grocery_list: { category: string; items: string[] }[];
  prep_instructions: string[];
  storage_tips: string[];
  total_prep_time_hours: number;
}

export default function PlanPage() {
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState<string>();
  const supabase = createClient();

  // Wizard state
  const [planType, setPlanType] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState(5);
  const [selectedMeals, setSelectedMeals] = useState<string[]>(["dinner"]);
  const [proteins, setProteins] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [exclusionInput, setExclusionInput] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  
  // Cooking style toggles (can mix and match)
  const [cookingStyles, setCookingStyles] = useState<string[]>([]);
  
  // Reduced waste is separate
  const [reducedWaste, setReducedWaste] = useState(false);
  
  // Loading progress state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MealPlanResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

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
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    }
    init();
  }, [supabase.auth]);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setLoadingProgress(0);
    
    // Simulate progress while waiting for API
    const progressMessages = [
      "Analyzing your preferences...",
      "Finding budget-friendly ingredients...",
      "Creating delicious recipes...",
      "Building your grocery list...",
      "Organizing prep instructions...",
      "Finalizing your meal plan..."
    ];
    
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setLoadingProgress(Math.floor(progress));
      const messageIndex = Math.min(Math.floor(progress / 18), progressMessages.length - 1);
      setLoadingMessage(progressMessages[messageIndex]);
    }, 800);
    
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          adults,
          children,
          days,
          selectedMeals,
          proteins,
          exclusions,
          dietary,
          cookingStyles,
          reducedWaste,
        }),
      });

      clearInterval(progressInterval);
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate meal plan");
        setLoading(false);
        setLoadingProgress(0);
        return;
      }

      setLoadingProgress(100);
      setLoadingMessage("Done! Loading your plan...");
      
      const data = await res.json();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResult(data);
      setLoading(false);
      setLoadingProgress(0);
      setSaved(false);
      setStep(7);
    } catch {
      clearInterval(progressInterval);
      setError("Failed to generate meal plan");
      setLoading(false);
      setLoadingProgress(0);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);

    const res = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: result.title,
        description: result.description,
        plan_type: planType,
        people: adults + children,
        days,
        meals_per_day: selectedMeals.length,
        total_prep_time_hours: result.total_prep_time_hours,
        plan_data: {
          days: result.days,
          grocery_list: result.grocery_list,
          prep_instructions: result.prep_instructions,
          storage_tips: result.storage_tips,
        },
      }),
    });

    if (res.ok) {
      setSaved(true);
    }
    setSaving(false);
  }

  function toggleProtein(p: string) {
    if (proteins.includes(p)) {
      setProteins(proteins.filter(x => x !== p));
    } else {
      // Add protein and remove conflicting dietary restrictions
      const conflicts = PROTEIN_CONFLICTS[p] || [];
      if (conflicts.length > 0) {
        setDietary(dietary.filter(d => !conflicts.includes(d)));
      }
      setProteins([...proteins, p]);
    }
  }

  function toggleDietary(d: string) {
    if (dietary.includes(d)) {
      setDietary(dietary.filter(x => x !== d));
    } else {
      // Add dietary restriction and remove conflicting proteins
      const conflictingProteins = Object.entries(PROTEIN_CONFLICTS)
        .filter(([, restrictions]) => restrictions.includes(d))
        .map(([protein]) => protein);
      
      if (conflictingProteins.length > 0) {
        setProteins(proteins.filter(p => !conflictingProteins.includes(p)));
      }
      setDietary([...dietary, d]);
    }
  }

  // Get current conflicts for display
  function getConflictWarning(): string | null {
    for (const protein of proteins) {
      const conflicts = PROTEIN_CONFLICTS[protein] || [];
      for (const d of dietary) {
        if (conflicts.includes(d)) {
          return `"${protein}" conflicts with "${d}" - we'll automatically adjust`;
        }
      }
    }
    return null;
  }

  function toggleMealType(m: string) {
    if (selectedMeals.includes(m)) {
      if (selectedMeals.length > 1) {
        setSelectedMeals(selectedMeals.filter(x => x !== m));
      }
    } else {
      setSelectedMeals([...selectedMeals, m]);
    }
  }

  function toggleCookingStyle(style: string) {
    if (cookingStyles.includes(style)) {
      setCookingStyles(cookingStyles.filter(x => x !== style));
    } else {
      setCookingStyles([...cookingStyles, style]);
    }
  }

  function addExclusion(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && exclusionInput.trim()) {
      e.preventDefault();
      const item = exclusionInput.trim().toLowerCase();
      if (!exclusions.includes(item)) {
        setExclusions([...exclusions, item]);
      }
      setExclusionInput("");
    }
  }

  function removeExclusion(item: string) {
    setExclusions(exclusions.filter(x => x !== item));
  }

  const selectedPlan = PLAN_TYPES.find(p => p.id === planType);

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        
        {/* Header */}
        {step === 1 && (
          <div className="mb-12 text-center">
            <span className="text-5xl sm:text-6xl mb-4 block">📅</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Meal Plan <span className="text-accent">Wizard</span>
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Create a complete meal prep plan with full recipes, grocery lists, and prep instructions in just 6 steps.
            </p>
          </div>
        )}

        {/* Progress indicator */}
        {step < 7 && (
          <div className="flex gap-1 mb-8">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 ${s <= step ? "bg-accent" : "bg-border"}`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Choose Plan Type */}
        {step === 1 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              How do you want to approach your week?
            </h2>
            <p className="text-muted mb-6">Choose your cooking style.</p>

            <div className="space-y-3">
              {PLAN_TYPES.map((plan, index) => (
                <button
                  key={plan.id}
                  onClick={() => setPlanType(plan.id)}
                  className={`w-full p-5 sm:p-6 text-left border-2 transition-all ${
                    planType === plan.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <span className={`text-4xl sm:text-5xl font-black leading-none ${
                      planType === plan.id ? "text-accent" : "text-border"
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 pt-1">
                      <span className="text-lg font-bold block">{plan.label}</span>
                      <span className="text-sm text-muted block mb-1">{plan.desc}</span>
                      <span className="text-xs text-accent">{plan.details}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!planType}
                className="btn-primary"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: How many people & days */}
        {step === 2 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 2 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Who are you feeding?
            </h1>
            <p className="text-muted mb-8">Tell us about your household.</p>

            <div className="space-y-8">
              {/* Adults & Children */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label block mb-3">Adults</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(0, adults - 1))}
                      className="w-10 h-10 border-2 border-border text-xl font-bold hover:border-foreground"
                    >
                      -
                    </button>
                    <span className="text-3xl font-black w-12 text-center">{adults}</span>
                    <button
                      onClick={() => setAdults(Math.min(10, adults + 1))}
                      className="w-10 h-10 border-2 border-border text-xl font-bold hover:border-foreground"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label block mb-3">Children</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-10 h-10 border-2 border-border text-xl font-bold hover:border-foreground"
                    >
                      -
                    </button>
                    <span className="text-3xl font-black w-12 text-center">{children}</span>
                    <button
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      className="w-10 h-10 border-2 border-border text-xl font-bold hover:border-foreground"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-muted mt-1">Half portions</p>
                </div>
              </div>

              <div>
                <label className="label block mb-3">Number of Days</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setDays(Math.max(1, days - 1))}
                    className="w-12 h-12 border-2 border-border text-2xl font-bold hover:border-foreground"
                  >
                    -
                  </button>
                  <span className="text-4xl font-black w-16 text-center">{days}</span>
                  <button
                    onClick={() => setDays(Math.min(14, days + 1))}
                    className="w-12 h-12 border-2 border-border text-2xl font-bold hover:border-foreground"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="label block mb-3">Which meals are you planning?</label>
                <div className="flex flex-wrap gap-3">
                  {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                    <button
                      key={meal.toLowerCase()}
                      onClick={() => toggleMealType(meal.toLowerCase())}
                      className={`px-6 py-3 border-2 font-bold transition-all ${
                        selectedMeals.includes(meal.toLowerCase())
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooking Style - Mix and Match */}
              <div className="pt-4 border-t border-border">
                <label className="label block mb-2">Cooking style</label>
                <p className="text-muted text-sm mb-4">Select any that apply - we&apos;ll give you a mix!</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { id: "simple", label: "Simple", desc: "Easy, beginner-friendly" },
                    { id: "crockpot", label: "Crock Pot", desc: "Slow cooker recipes" },
                    { id: "gourmet", label: "Gourmet", desc: "Special occasion worthy" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => toggleCookingStyle(style.id)}
                      className={`p-4 text-left border-2 transition-all ${
                        cookingStyles.includes(style.id)
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      <span className="font-bold block">{style.label}</span>
                      <span className="text-xs text-muted">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Waste - Separate Toggle */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => setReducedWaste(!reducedWaste)}
                  className={`w-full p-4 text-left border-2 transition-all flex items-center gap-4 ${
                    reducedWaste ? "border-green-500 bg-green-500/10" : "border-border hover:border-foreground"
                  }`}
                >
                  <span className={`w-6 h-6 border-2 flex items-center justify-center text-sm ${
                    reducedWaste ? "bg-green-500 border-green-500 text-white" : "border-border"
                  }`}>
                    {reducedWaste && "✓"}
                  </span>
                  <div className="flex-1">
                    <span className="font-bold block">♻️ Reduced Waste Mode</span>
                    <span className="text-sm text-muted">Recipes share ingredients so you use almost everything you buy</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={adults + children === 0}
                className="btn-primary"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Protein preferences */}
        {step === 3 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 3 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Protein preferences
            </h1>
            <p className="text-muted mb-8">Select all proteins you enjoy. We&apos;ll vary them throughout your plan.</p>

            <div className="flex flex-wrap gap-2">
              {PROTEIN_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggleProtein(p)}
                  className={`px-4 py-2 border-2 font-medium transition-all ${
                    proteins.includes(p)
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(4)} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Exclusions */}
        {step === 4 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 4 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Anything you dislike?
            </h1>
            <p className="text-muted mb-8">
              Not allergies, just foods you don&apos;t enjoy. Type and press Enter to add.
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exclusionInput}
                  onChange={(e) => setExclusionInput(e.target.value)}
                  onKeyDown={addExclusion}
                  placeholder="Type an ingredient and press Enter..."
                  className="input text-lg flex-1"
                />
                <button
                  onClick={() => {
                    if (exclusionInput.trim()) {
                      const item = exclusionInput.trim().toLowerCase();
                      if (!exclusions.includes(item)) {
                        setExclusions([...exclusions, item]);
                      }
                      setExclusionInput("");
                    }
                  }}
                  className="btn-secondary px-6"
                >
                  Add
                </button>
              </div>

              {exclusions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exclusions.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-sm font-medium"
                    >
                      {item}
                      <button
                        onClick={() => removeExclusion(item)}
                        className="hover:text-accent text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted mt-4">Skip this step if there&apos;s nothing you want to exclude.</p>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(3)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(5)} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Dietary restrictions */}
        {step === 5 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 5 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Dietary restrictions
            </h1>
            <p className="text-muted mb-8">Select any that apply. Skip if none.</p>

            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDietary(d)}
                  className={`px-4 py-2 border-2 font-medium transition-all ${
                    dietary.includes(d)
                      ? "bg-accent text-white border-accent"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(4)} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep(6)} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Review & Generate */}
        {step === 6 && (
          <div>
            <p className="label text-xs sm:text-sm mb-2">Step 6 of 6</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
              Review your plan
            </h1>
            <p className="text-muted mb-8">Make sure everything looks right.</p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted">Plan Type</span>
                <span className="font-bold">{selectedPlan?.label}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted">Servings</span>
                <span className="font-bold">
                  {adults > 0 && `${adults} adult${adults > 1 ? 's' : ''}`}
                  {adults > 0 && children > 0 && ' + '}
                  {children > 0 && `${children} child${children > 1 ? 'ren' : ''}`}
                  {' × '}{days} days
                </span>
              </div>
              {selectedMeals.length > 0 && (planType === "full-week" || planType === "dinner-plan") && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Meals</span>
                  <span className="font-bold capitalize">{selectedMeals.join(", ")}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted">Proteins</span>
                <span className="font-bold">{proteins.length > 0 ? proteins.join(", ") : "Any"}</span>
              </div>
              {exclusions.length > 0 && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Excluding</span>
                  <span className="font-bold">{exclusions.join(", ")}</span>
                </div>
              )}
              {dietary.length > 0 && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Dietary</span>
                  <span className="font-bold">{dietary.join(", ")}</span>
                </div>
              )}
              {cookingStyles.length > 0 && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Cooking Style</span>
                  <span className="font-bold">
                    {cookingStyles.map(s => 
                      s === 'simple' ? 'Simple' : 
                      s === 'crockpot' ? 'Crock Pot' : 
                      'Gourmet'
                    ).join(", ")}
                  </span>
                </div>
              )}
              {reducedWaste && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Reduced Waste</span>
                  <span className="font-bold text-green-600">♻️ Yes - minimize waste</span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-accent font-medium mb-4">{error}</p>
            )}

            {loading ? (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{loadingMessage}</span>
                  <span className="font-bold text-accent">{loadingProgress}%</span>
                </div>
                <div className="h-3 bg-border overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted text-center">
                  This usually takes 15-30 seconds...
                </p>
              </div>
            ) : (
              <div className="flex justify-between">
                <button onClick={() => setStep(5)} className="btn-secondary">
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Generate Meal Plan 🍳
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Results */}
        {step === 7 && result && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
                {result.title}
              </h1>
              <p className="text-muted">{result.description}</p>
              {planType === "weekly-prep" && result.total_prep_time_hours && (
                <p className="text-sm text-accent font-bold mt-2">
                  Total prep time: ~{result.total_prep_time_hours} hours
                </p>
              )}
            </div>

            {/* Grocery List */}
            <div className="mb-12 p-6 bg-card border border-border">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">🛒 Grocery List</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {result.grocery_list.map((cat) => (
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
                {result.days.map((day, dayIndex) => (
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
                                  <div className="flex flex-wrap gap-x-3 text-xs text-muted mt-1">
                                    <span>Prep: {meal.prep_time_minutes} min</span>
                                    {meal.cook_time_minutes && <span>Cook: {meal.cook_time_minutes} min</span>}
                                    {(meal.adult_servings || meal.child_servings) && (
                                      <span className="text-accent">
                                        Serves: {meal.adult_servings || 0} adult{(meal.adult_servings || 0) !== 1 ? 's' : ''}
                                        {meal.child_servings ? ` + ${meal.child_servings} child${meal.child_servings !== 1 ? 'ren' : ''}` : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-muted mb-1">per adult serving</p>
                                  <div className="flex gap-3 text-xs text-center">
                                    <div>
                                      <p className="font-bold text-accent">{meal.macros_per_adult_serving?.calories || meal.macros?.calories || 0}</p>
                                      <p className="text-muted">cal</p>
                                    </div>
                                    <div>
                                      <p className="font-bold">{meal.macros_per_adult_serving?.protein_g || meal.macros?.protein_g || 0}g</p>
                                      <p className="text-muted">pro</p>
                                    </div>
                                    <div>
                                      <p className="font-bold">{meal.macros_per_adult_serving?.carbs_g || meal.macros?.carbs_g || 0}g</p>
                                      <p className="text-muted">carb</p>
                                    </div>
                                    <div>
                                      <p className="font-bold">{meal.macros_per_adult_serving?.fat_g || meal.macros?.fat_g || 0}g</p>
                                      <p className="text-muted">fat</p>
                                    </div>
                                  </div>
                                  {children > 0 && (
                                    <p className="text-[10px] text-muted mt-1">Children: half portions</p>
                                  )}
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
                                        {meal.instructions.map((instrStep, i) => (
                                          <li key={i} className="text-sm flex gap-3">
                                            <span className="w-5 h-5 bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0">
                                              {i + 1}
                                            </span>
                                            <span>{instrStep}</span>
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

            {/* Prep Instructions - only for weekly prep */}
            {planType === "weekly-prep" && result.prep_instructions && result.prep_instructions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">👨‍🍳 Prep Day Instructions</h2>
                <p className="text-muted text-sm mb-4">Follow these steps on your prep day to get everything ready for the week.</p>
                <ol className="space-y-3">
                  {result.prep_instructions.map((instrStep, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="w-8 h-8 bg-foreground text-background font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="pt-1">{instrStep}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Storage Tips */}
            <div className="mb-12 p-6 bg-card border border-border">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">💡 Storage Tips</h2>
              <ul className="space-y-2">
                {result.storage_tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-accent">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`btn-primary ${saved ? "bg-green-600 border-green-600" : ""}`}
              >
                {saving ? "Saving..." : saved ? "✓ Saved to My Meal Plans" : "Save Plan"}
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setResult(null);
                  setSaved(false);
                }}
                className="btn-secondary"
              >
                Create Another Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
