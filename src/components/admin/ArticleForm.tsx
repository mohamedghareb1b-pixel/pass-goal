"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Article, FaqItem } from "@/domain/entities/Article";

interface CategoryOption {
  id: string;
  name: string;
}
interface MatchOption {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
}

function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) onChange(data.url);
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {value && <img src={value} alt="" className="w-40 h-24 object-cover rounded-lg mb-2 border border-line" />}
      <input type="file" accept="image/*" onChange={handleFile} className="text-xs" />
      {uploading && <p className="text-xs text-ink-soft mt-1">Compressing to WebP and uploading…</p>}
    </div>
  );
}

export default function ArticleForm({
  initial,
  categories,
  matches,
  authors,
}: {
  initial?: Partial<Article> & { authorId?: string | null };
  categories: CategoryOption[];
  matches: MatchOption[];
  authors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [authorId, setAuthorId] = useState(initial?.authorId ?? authors[0]?.id ?? "");
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [quickAnswer, setQuickAnswer] = useState(initial?.quickAnswer ?? "");
  const [imageOneUrl, setImageOneUrl] = useState(initial?.imageOneUrl ?? "");
  const [imageTwoUrl, setImageTwoUrl] = useState(initial?.imageTwoUrl ?? "");
  const [bodyPartOne, setBodyPartOne] = useState(initial?.bodyPartOne ?? "");
  const [bodyPartTwo, setBodyPartTwo] = useState(initial?.bodyPartTwo ?? "");
  const [faq, setFaq] = useState<FaqItem[]>(initial?.faq ?? []);
  const [linkedMatchId, setLinkedMatchId] = useState(initial?.linkedMatchId ?? "");
  const [published, setPublished] = useState(Boolean(initial?.publishedAt));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFaqRow() {
    setFaq((f) => [...f, { question: "", answer: "" }]);
  }
  function updateFaqRow(i: number, field: keyof FaqItem, value: string) {
    setFaq((f) => f.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function removeFaqRow(i: number) {
    setFaq((f) => f.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Add at least one category first — go to Admin → Categories, then come back.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: initial?.id,
        title,
        slug,
        categoryId,
        authorId: authorId || null,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        metaTitle,
        metaDescription,
        quickAnswer,
        imageOneUrl,
        imageTwoUrl,
        bodyPartOne,
        bodyPartTwo,
        faq,
        linkedMatchId: linkedMatchId || null,
        publishedAt: published ? initial?.publishedAt ?? new Date().toISOString() : null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || `Save failed (${res.status})`);
      return;
    }

    router.push("/admin/articles");
  }

  const inputClass = "w-full border border-line rounded-lg px-3 py-2 text-sm";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-live/10 border border-live text-live text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div>
        <label className={labelClass}>Title</label>
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <label className={labelClass}>Slug</label>
        <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </div>

      <div>
        <label className={labelClass}>Author</label>
        {authors.length === 0 ? (
          <p className="text-xs text-live">
            No authors yet —{" "}
            <a href="/admin/authors" className="underline font-bold">
              add one first
            </a>
            .
          </p>
        ) : (
          <select className={inputClass} value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          {categories.length === 0 ? (
            <p className="text-xs text-live">
              No categories yet —{" "}
              <a href="/admin/categories" className="underline font-bold">
                add one first
              </a>
              .
            </p>
          ) : (
            <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className={labelClass}>Link to match (optional)</label>
          {matches.length === 0 ? (
            <p className="text-xs text-ink-soft">
              No synced matches yet — run &quot;Sync now from API&quot; in Matches Management.
            </p>
          ) : (
            <select className={inputClass} value={linkedMatchId} onChange={(e) => setLinkedMatchId(e.target.value)}>
              <option value="">— None —</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.homeTeamId} vs {m.awayTeamId}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input className={inputClass} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="derby, arsenal, analysis" />
      </div>

      <fieldset className="border border-line rounded-xl p-4 space-y-4">
        <legend className="text-xs font-mono uppercase text-ink-soft px-1">SEO</legend>
        <div>
          <label className={labelClass}>Meta title</label>
          <input className={inputClass} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Meta description</label>
          <textarea className={inputClass} rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} required />
        </div>
      </fieldset>

      <div>
        <label className={labelClass}>Quick answer</label>
        <textarea className={inputClass} rows={2} value={quickAnswer} onChange={(e) => setQuickAnswer(e.target.value)} required />
      </div>

      <ImageUploadField label="Image 1 (appears before Quick Answer)" value={imageOneUrl} onChange={setImageOneUrl} />

      <div>
        <label className={labelClass}>Body — part 1</label>
        <textarea className={inputClass} rows={6} value={bodyPartOne} onChange={(e) => setBodyPartOne(e.target.value)} required />
        <p className="text-xs text-ink-soft mt-1">
          The ticket link (if the linked match is upcoming) renders automatically right after this section.
        </p>
      </div>

      <ImageUploadField label="Image 2 (newsletter prompt appears right after)" value={imageTwoUrl} onChange={setImageTwoUrl} />

      <div>
        <label className={labelClass}>Body — part 2</label>
        <textarea className={inputClass} rows={6} value={bodyPartTwo} onChange={(e) => setBodyPartTwo(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>FAQ</label>
        <div className="space-y-3">
          {faq.map((row, i) => (
            <div key={i} className="border border-line rounded-lg p-3 space-y-2">
              <input
                className={inputClass}
                placeholder="Question"
                value={row.question}
                onChange={(e) => updateFaqRow(i, "question", e.target.value)}
              />
              <textarea
                className={inputClass}
                placeholder="Answer"
                rows={2}
                value={row.answer}
                onChange={(e) => updateFaqRow(i, "answer", e.target.value)}
              />
              <button type="button" onClick={() => removeFaqRow(i)} className="text-xs text-live">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addFaqRow} className="text-xs font-bold text-purple mt-2">
          + Add FAQ item
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Publish now (uncheck to save as draft)
      </label>

      <button type="submit" disabled={saving} className="bg-purple text-white font-bold rounded-lg px-5 py-2.5 text-sm disabled:opacity-50">
        {saving ? "Saving…" : "Save article"}
      </button>
    </form>
  );
}
