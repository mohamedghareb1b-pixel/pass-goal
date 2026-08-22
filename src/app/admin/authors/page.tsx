"use client";

import { useEffect, useState } from "react";
import type { Author } from "@/infrastructure/repositories/AuthorsRepository";

export default function AuthorsPage() {
  const [authorsList, setAuthorsList] = useState<Author[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((d) => setAuthorsList(d.authors));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) setAvatarUrl(data.url);
    setUploading(false);
  }

  async function addAuthor(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/admin/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), bio, avatarUrl }),
    });
    setName("");
    setBio("");
    setAvatarUrl("");
    setSaving(false);
    load();
  }

  async function removeAuthor(id: string) {
    await fetch("/api/admin/authors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const inputClass = "w-full border border-line rounded-lg px-3 py-2 text-sm";

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl mb-1">Authors</h1>
      <p className="text-sm text-ink-soft mb-6">
        Each author gets a page with their name, bio, photo, and every article linked to them.
      </p>

      <form onSubmit={addAuthor} className="bg-paper border border-line rounded-2xl p-4 space-y-3 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Shindy" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Short bio</label>
          <textarea className={inputClass} rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Photo</label>
          {avatarUrl && (
            <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover mb-2 border border-line" />
          )}
          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="text-xs" />
          {uploading && <p className="text-xs text-ink-soft mt-1">Compressing to WebP and uploading…</p>}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-purple text-white text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50"
        >
          Add author
        </button>
      </form>

      <div className="bg-paper border border-line rounded-2xl divide-y divide-line">
        {authorsList.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3">
            {a.avatarUrl && <img src={a.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />}
            <div className="flex-1">
              <p className="text-sm font-medium">{a.name}</p>
              <p className="text-xs text-ink-soft font-mono">/authors/{a.slug}</p>
            </div>
            <button onClick={() => removeAuthor(a.id)} className="text-xs text-live">
              Delete
            </button>
          </div>
        ))}
        {authorsList.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">No authors yet.</p>
        )}
      </div>
    </div>
  );
}
