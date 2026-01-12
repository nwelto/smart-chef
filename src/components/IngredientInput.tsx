"use client";

import { useState, KeyboardEvent } from "react";

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const trimmed = input.trim().toLowerCase();
      if (!ingredients.includes(trimmed)) {
        onChange([...ingredients, trimmed]);
      }
      setInput("");
    }
  }

  function removeIngredient(index: number) {
    onChange(ingredients.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Ingredients
      </label>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type an ingredient and press Enter"
        className="input mb-3"
      />
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <span key={index} className="tag">
              {ingredient}
              <button
                onClick={() => removeIngredient(index)}
                className="ml-1 hover:text-red-500"
                aria-label={`Remove ${ingredient}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {ingredients.length === 0 && (
        <p className="text-sm text-muted">
          Add at least 2-3 ingredients to generate a recipe
        </p>
      )}
    </div>
  );
}
