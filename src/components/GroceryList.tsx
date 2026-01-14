"use client";

import { useMemo } from "react";
import { aggregateGroceryList } from "@/lib/grocery";
import type { MealPlanResponse, GroceryList as GroceryListType } from "@/lib/types";

interface GroceryListProps {
  plan: MealPlanResponse;
  groceryList?: GroceryListType | null;
}

export function GroceryList({ plan, groceryList }: GroceryListProps) {
  const list = useMemo(() => {
    return groceryList || aggregateGroceryList(plan);
  }, [plan, groceryList]);

  function handleDownload() {
    let text = "GROCERY LIST\n";
    text += "=".repeat(40) + "\n\n";

    for (const category of list.categories) {
      text += `${category.name.toUpperCase()}\n`;
      text += "-".repeat(20) + "\n";
      for (const item of category.items) {
        text += `[ ] ${item.amount} ${item.item}\n`;
      }
      text += "\n";
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grocery-list.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <p className="label text-xs sm:text-sm mb-2">Shopping List</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
          Grocery List
        </h2>
        <p className="text-muted text-sm sm:text-base mt-2">
          All ingredients aggregated from your meal plan
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {list.categories.map((category) => (
          <div key={category.name} className="border border-border">
            <div className="bg-foreground text-background px-4 sm:px-6 py-2 sm:py-3">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider">
                {category.name}
              </h3>
            </div>
            <ul className="divide-y divide-border">
              {category.items.map((item, index) => (
                <li
                  key={index}
                  className="px-4 sm:px-6 py-3 flex justify-between items-center"
                >
                  <span className="text-sm sm:text-base">{item.item}</span>
                  <span className="text-sm text-muted font-medium">
                    {item.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm sm:text-base"
        >
          Print List
        </button>
        <button
          onClick={handleDownload}
          className="btn-secondary text-sm sm:text-base"
        >
          Download as Text
        </button>
      </div>
    </div>
  );
}
