import type { MealPlanResponse, GroceryList, GroceryItem } from "./types";

// Ingredient categorization map
const CATEGORY_MAP: Record<string, string> = {
  // Proteins
  chicken: "Proteins",
  beef: "Proteins",
  pork: "Proteins",
  fish: "Proteins",
  salmon: "Proteins",
  shrimp: "Proteins",
  tofu: "Proteins",
  eggs: "Proteins",
  turkey: "Proteins",
  bacon: "Proteins",
  sausage: "Proteins",
  lamb: "Proteins",

  // Dairy
  milk: "Dairy",
  cheese: "Dairy",
  butter: "Dairy",
  yogurt: "Dairy",
  cream: "Dairy",
  "sour cream": "Dairy",

  // Produce
  onion: "Produce",
  garlic: "Produce",
  tomato: "Produce",
  lettuce: "Produce",
  carrot: "Produce",
  celery: "Produce",
  pepper: "Produce",
  potato: "Produce",
  broccoli: "Produce",
  spinach: "Produce",
  cucumber: "Produce",
  apple: "Produce",
  banana: "Produce",
  lemon: "Produce",
  lime: "Produce",
  avocado: "Produce",
  mushroom: "Produce",
  zucchini: "Produce",

  // Grains & Bread
  bread: "Grains & Bread",
  rice: "Grains & Bread",
  pasta: "Grains & Bread",
  flour: "Grains & Bread",
  oats: "Grains & Bread",
  tortilla: "Grains & Bread",
  noodles: "Grains & Bread",
  quinoa: "Grains & Bread",

  // Pantry
  oil: "Pantry",
  salt: "Pantry",
  sugar: "Pantry",
  sauce: "Pantry",
  vinegar: "Pantry",
  broth: "Pantry",
  stock: "Pantry",
  honey: "Pantry",
  maple: "Pantry",
  beans: "Pantry",
  lentils: "Pantry",
};

function categorizeIngredient(item: string): string {
  const lowerItem = item.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lowerItem.includes(keyword)) return category;
  }
  return "Other";
}

function parseAmount(amount: string): { quantity: number; unit: string } {
  const match = amount.match(/^([\d.\/]+)\s*(.*)$/);
  if (!match) return { quantity: 1, unit: amount };

  let quantity = 0;
  const numStr = match[1];
  if (numStr.includes("/")) {
    const parts = numStr.split("/");
    if (parts.length === 2) {
      const [num, denom] = parts.map(Number);
      quantity = num / denom;
    }
  } else {
    quantity = parseFloat(numStr);
  }

  return { quantity: isNaN(quantity) ? 1 : quantity, unit: match[2].trim() };
}

export function aggregateGroceryList(plan: MealPlanResponse): GroceryList {
  const ingredientMap = new Map<
    string,
    { amount: number; unit: string; category: string }
  >();

  // Collect all ingredients from all meals
  for (const day of plan.days) {
    for (const mealType of Object.keys(day.meals) as Array<
      keyof typeof day.meals
    >) {
      const meal = day.meals[mealType];
      if (!meal) continue;

      for (const ing of meal.ingredients) {
        const key = ing.item.toLowerCase().trim();
        const { quantity, unit } = parseAmount(ing.amount);
        const category = categorizeIngredient(key);

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          // Only aggregate if same unit
          if (existing.unit === unit) {
            existing.amount += quantity;
          }
        } else {
          ingredientMap.set(key, { amount: quantity, unit, category });
        }
      }
    }
  }

  // Group by category
  const categoryMap = new Map<string, GroceryItem[]>();

  for (const [item, data] of ingredientMap) {
    const { amount, unit, category } = data;
    const displayAmount = unit ? `${amount} ${unit}` : String(amount);

    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push({
      item: item.charAt(0).toUpperCase() + item.slice(1),
      amount: displayAmount,
      category,
    });
  }

  // Sort categories and items
  const sortedCategories = Array.from(categoryMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => ({
      name,
      items: items.sort((a, b) => a.item.localeCompare(b.item)),
    }));

  return { categories: sortedCategories };
}
