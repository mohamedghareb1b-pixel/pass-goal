"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategoriesList(d.categories));
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || `Failed to add category (${res.status})`);
      return;
    }

    setNewName("");
    load();
  }

  async function removeCategory(id: string) {
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl mb-1">Categories</h1>
      <p className="text-sm text-ink-soft mb-6">
        Manage article categories — e.g. &quot;Before Match&quot;, &quot;Results&quot;, &quot;Analysis&quot;.
        These show up in the category dropdown when writing an article.
      </p>

      <form onSubmit={addCategory} className="flex gap-2 mb-2">
        <input
          className="flex-1 border border-line rounded-lg px-3 py-2 text-sm"
          placeholder="New category name — e.g. Before Match"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-purple text-white text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Adding…" : "Add"}
        </button>
      </form>

      {error && <p className="text-xs text-live mb-4">{error}</p>}

      <div className="bg-paper border border-line rounded-2xl divide-y divide-line">
        {categoriesList.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-ink-soft font-mono">/{c.slug}</p>
            </div>
            <button onClick={() => removeCategory(c.id)} className="text-xs text-live">
              Delete
            </button>
          </div>
        ))}
        {categoriesList.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
