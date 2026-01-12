"use client";

import type { Spice } from "@/lib/types";

interface SpiceSelectorProps {
  spices: Spice[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function SpiceSelector({ spices, selected, onChange }: SpiceSelectorProps) {
  const categories = [...new Set(spices.map((s) => s.category))];

  function toggleSpice(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-3">
        Available Spices
      </label>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category}>
            <p className="text-sm text-muted mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {spices
                .filter((s) => s.category === category)
                .map((spice) => (
                  <label
                    key={spice.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                      selected.includes(spice.name)
                        ? "bg-primary text-white"
                        : "bg-accent hover:bg-primary/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(spice.name)}
                      onChange={() => toggleSpice(spice.name)}
                      className="sr-only"
                    />
                    {spice.name}
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
