"use client";

import { useEffect, useState } from "react";
import ArticleForm from "@/components/admin/ArticleForm";

export default function NewArticlePage() {
  const [categories, setCategories] = useState([]);
  const [matches, setMatches] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories);
        setMatches(data.matches);
      });
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((data) => setAuthors(data.authors));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">New article</h1>
      <ArticleForm categories={categories} matches={matches} authors={authors} />
    </div>
  );
}
