"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/domain/entities/Article";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch("/api/articles", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((d) => setArticles(d.articles))
      .catch((err) => {
        setError(err.name === "AbortError" ? "Timed out loading articles — try again." : "Couldn't load articles — try again.");
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <main>
      {/* Hero — same purple as the header above, so nav and headline read
          as one continuous block instead of two stacked bars. */}
      <div className="bg-purple text-chalk relative overflow-hidden -mt-px">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(255,255,255,0.6) 38px, rgba(255,255,255,0.6) 39px)",
          }}
        />
        <div className="max-w-4xl mx-auto px-5 pt-4 pb-8 relative">
          <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-wider text-gold font-bold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-live pg-live-ring" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
            </span>
            Live coverage · Premier League
          </div>
          <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-[1.05]">
            Every matchday,
            <br />
            told properly.
          </h1>
          <span className="pg-underline block h-[3px] w-16 bg-pitch-bright mt-4 rounded-full" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-7">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl sm:text-2xl">Latest coverage</h2>
          <Link
            href="/fixtures"
            className="font-mono text-xs uppercase tracking-wide text-pitch font-bold hover:text-pitch-bright transition-colors"
          >
            Fixtures &amp; results →
          </Link>
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 gap-5" aria-label="Loading articles" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-paper border border-line rounded-2xl overflow-hidden">
                <div className="w-full h-40 pg-shimmer" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 w-4/5 rounded pg-shimmer" />
                  <div className="h-3 w-full rounded pg-shimmer" />
                  <div className="h-3 w-2/3 rounded pg-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-live/10 border border-live/30 text-live text-sm rounded-2xl px-4 py-3">{error}</div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="bg-paper border border-line rounded-2xl p-8 text-center">
            <p className="text-sm text-ink-soft mb-4">
              No articles published yet. Once you publish one from the admin panel, it&apos;ll appear here.
            </p>
            <Link href="/fixtures" className="text-sm font-bold text-pitch underline underline-offset-2">
              See fixtures &amp; results instead →
            </Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          {!loading &&
            articles.map((article, i) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group pg-fade-up bg-paper border border-line rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-pitch-bright/40 transition-all duration-300"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                {article.imageOneUrl && (
                  <div className="overflow-hidden">
                    <Image
                      src={article.imageOneUrl}
                      alt={article.title}
                      width={500}
                      height={280}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-display text-base leading-snug mb-1.5 group-hover:text-pitch transition-colors">
                    {article.title}
                  </p>
                  <p className="text-xs text-ink-soft line-clamp-2">{article.quickAnswer}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </main>
  );
}
