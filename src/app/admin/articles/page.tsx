"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Article } from "@/domain/entities/Article";

export default function ArticlesListPage() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((data) => setArticlesList(data.articles));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Articles</h1>
        <Link href="/admin/articles/new" className="bg-purple text-white text-sm font-bold rounded-lg px-4 py-2">
          + New article
        </Link>
      </div>

      <div className="bg-paper border border-line rounded-2xl divide-y divide-line">
        {articlesList.map((a) => (
          <Link
            key={a.id}
            href={`/admin/articles/${a.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-chalk"
          >
            <div>
              <p className="font-medium text-sm">{a.title}</p>
              <p className="text-xs text-ink-soft">/{a.slug}</p>
            </div>
            <span className="text-xs font-mono text-ink-soft">
              {a.publishedAt ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
        {articlesList.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">No articles yet.</p>
        )}
      </div>
    </div>
  );
}
