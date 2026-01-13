"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import type { ShoppingList, ShoppingListItem } from "@/lib/types";

const CATEGORIES = ["Proteins", "Produce", "Dairy", "Pantry", "Frozen", "Bakery", "Other"];

export default function ShoppingPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>();
  const [newItem, setNewItem] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email);

      const res = await fetch("/api/shopping-lists");
      if (res.ok) {
        const data = await res.json();
        setLists(data);
        if (data.length > 0) {
          setActiveList(data[0]);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [supabase.auth, router]);

  async function createNewList() {
    const res = await fetch("/api/shopping-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Shopping List", items: [] }),
    });

    if (res.ok) {
      const newList = await res.json();
      setLists([newList, ...lists]);
      setActiveList(newList);
    }
  }

  async function updateList(items: ShoppingListItem[]) {
    if (!activeList) return;

    const res = await fetch(`/api/shopping-lists/${activeList.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (res.ok) {
      const updatedList = await res.json();
      setActiveList(updatedList);
      setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
    }
  }

  function toggleItem(itemId: string) {
    if (!activeList) return;
    const items = activeList.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    updateList(items);
  }

  function removeItem(itemId: string) {
    if (!activeList) return;
    const items = activeList.items.filter(item => item.id !== itemId);
    updateList(items);
  }

  function addItem() {
    if (!activeList || !newItem.trim()) return;
    const item: ShoppingListItem = {
      id: crypto.randomUUID(),
      item: newItem.trim(),
      amount: newAmount.trim() || "1",
      category: newCategory,
      checked: false,
    };
    updateList([...activeList.items, item]);
    setNewItem("");
    setNewAmount("");
  }

  async function deleteList() {
    if (!activeList) return;
    const confirmed = window.confirm("Delete this shopping list?");
    if (!confirmed) return;

    const res = await fetch(`/api/shopping-lists/${activeList.id}`, { method: "DELETE" });
    if (res.ok) {
      const remaining = lists.filter(l => l.id !== activeList.id);
      setLists(remaining);
      setActiveList(remaining[0] || null);
    }
  }

  function clearChecked() {
    if (!activeList) return;
    const items = activeList.items.filter(item => !item.checked);
    updateList(items);
  }

  // Group items by category
  const groupedItems = (activeList?.items || []).reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const checkedCount = activeList?.items.filter(i => i.checked).length || 0;
  const totalCount = activeList?.items.length || 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar userEmail={userEmail} />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="text-muted uppercase tracking-wider text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={userEmail} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="label text-xs sm:text-sm mb-2">At the Store</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[0.9]">
              Shopping
              <br />
              <span className="text-accent">List</span>
            </h1>
          </div>
          <button onClick={createNewList} className="btn-secondary text-sm self-start sm:self-auto">
            + New List
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="py-16 text-center border border-border">
            <p className="text-muted mb-6">No shopping lists yet</p>
            <button onClick={createNewList} className="btn-primary">
              Create Your First List
            </button>
          </div>
        ) : (
          <>
            {/* List Selector */}
            {lists.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {lists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => setActiveList(list)}
                    className={`px-4 py-2 text-sm font-medium border whitespace-nowrap transition-colors ${
                      activeList?.id === list.id
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {list.name}
                  </button>
                ))}
              </div>
            )}

            {activeList && (
              <>
                {/* Progress */}
                <div className="mb-6 p-4 bg-card border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted">Progress</span>
                    <span className="font-bold">{checkedCount} / {totalCount}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : "0%" }}
                    />
                  </div>
                </div>

                {/* Add Item */}
                <div className="mb-8 p-4 border border-border">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="Add item..."
                      className="flex-1 bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                      onKeyDown={(e) => e.key === "Enter" && addItem()}
                    />
                    <input
                      type="text"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-24 bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                    />
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button onClick={addItem} className="btn-primary text-sm px-6">
                      Add
                    </button>
                  </div>
                </div>

                {/* Items by Category */}
                {Object.keys(groupedItems).length === 0 ? (
                  <div className="py-12 text-center border border-border">
                    <p className="text-muted">No items in this list</p>
                    <p className="text-xs text-muted mt-2">Add items above or from your recipes and meal plans</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {CATEGORIES.filter(cat => groupedItems[cat]?.length > 0).map(category => (
                      <div key={category}>
                        <h3 className="font-bold text-accent mb-3">{category}</h3>
                        <div className="space-y-2">
                          {groupedItems[category].map(item => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-4 p-3 border border-border transition-colors ${
                                item.checked ? "opacity-50" : ""
                              }`}
                            >
                              <button
                                onClick={() => toggleItem(item.id)}
                                className={`w-6 h-6 border-2 shrink-0 flex items-center justify-center transition-colors ${
                                  item.checked
                                    ? "bg-accent border-accent text-white"
                                    : "border-border hover:border-foreground"
                                }`}
                              >
                                {item.checked && "✓"}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium ${item.checked ? "line-through" : ""}`}>
                                  {item.item}
                                </p>
                                <p className="text-xs text-muted">{item.amount}</p>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-xs text-muted hover:text-red-500 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-border">
                  {checkedCount > 0 && (
                    <button
                      onClick={clearChecked}
                      className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                    >
                      Clear {checkedCount} checked items
                    </button>
                  )}
                  <button
                    onClick={deleteList}
                    className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors ml-auto"
                  >
                    Delete List
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
