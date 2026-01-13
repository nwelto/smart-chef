"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

interface MealPlan {
  id: string;
  title: string;
  description: string;
  plan_type: string;
  people: number;
  days: number;
  total_prep_time_hours: number;
  created_at: string;
}

const PLAN_ICONS: Record<string, string> = {
  "freezer-burritos": "🌯",
  "dinner-plan": "🍽️",
  "lunch-prep": "🥗",
  "breakfast-prep": "🍳",
  "snack-prep": "🥜",
  "full-week": "📅",
};

export default function MealPlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      const res = await fetch("/api/meal-plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase.auth]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this meal plan?");
    if (!confirmed) return;

    const res = await fetch(`/api/meal-plans/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPlans(plans.filter((p) => p.id !== id));
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <p className="label text-xs sm:text-sm mb-2">Your Collection</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[0.9]">
              Meal
              <br />
              <span className="text-accent">Plans</span>
            </h1>
          </div>
          <Link href="/plan" className="btn-primary text-sm sm:text-base self-start sm:self-auto">
            New Plan
          </Link>
        </div>

        {loading ? (
          <div className="py-16 sm:py-24 text-center">
            <p className="text-muted uppercase tracking-wider text-xs sm:text-sm">Loading...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-12 sm:py-24 px-4 text-center border border-border">
            <p className="text-muted text-sm sm:text-base mb-4 sm:mb-6">No saved meal plans yet</p>
            <Link href="/plan" className="btn-primary text-sm sm:text-base">
              Create Your First Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-border p-4 sm:p-6 hover:border-foreground transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <span className="text-4xl">{PLAN_ICONS[plan.plan_type] || "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/meal-plans/${plan.id}`}>
                      <h3 className="text-xl font-bold hover:text-accent transition-colors">
                        {plan.title}
                      </h3>
                    </Link>
                    <p className="text-muted text-sm mt-1 line-clamp-2">{plan.description}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs sm:text-sm text-muted">
                      <span><strong className="text-foreground">{plan.people}</strong> people</span>
                      <span><strong className="text-foreground">{plan.days}</strong> days</span>
                      <span><strong className="text-foreground">~{plan.total_prep_time_hours}h</strong> prep</span>
                      <span className="hidden sm:inline">
                        {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:flex-col">
                    <Link
                      href={`/meal-plans/${plan.id}`}
                      className="text-xs font-bold uppercase tracking-wider hover:text-accent transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
