"use client";

import { useState } from "react";

interface AddToListButtonProps {
  items: { item: string; amount: string; category?: string }[];
  sourceId?: string;
  sourceType?: "recipe" | "meal_plan";
  className?: string;
}

export function AddToListButton({ items, sourceId, sourceType, className = "" }: AddToListButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  async function handleAdd() {
    if (items.length === 0) return;
    
    setLoading(true);
    const res = await fetch("/api/shopping-lists/add-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, source_id: sourceId, source_type: sourceType }),
    });

    if (res.ok) {
      const data = await res.json();
      setAdded(true);
      setResult({ added: data.added, skipped: data.skipped });
      setTimeout(() => {
        setAdded(false);
        setResult(null);
      }, 3000);
    }
    setLoading(false);
  }

  if (items.length === 0) return null;

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className={`text-sm font-medium border transition-colors ${
        added
          ? "bg-green-600 text-white border-green-600"
          : "border-border hover:border-foreground"
      } px-4 py-2 ${className}`}
    >
      {loading ? (
        "Adding..."
      ) : added && result ? (
        `✓ Added ${result.added} items`
      ) : (
        `🛒 Add ${items.length} to Shopping List`
      )}
    </button>
  );
}
