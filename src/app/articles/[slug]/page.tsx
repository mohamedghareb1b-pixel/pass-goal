import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DrizzleArticlesRepository } from "@/infrastructure/repositories/ArticlesRepository";
import { DrizzleMatchesRepository } from "@/infrastructure/repositories/MatchesRepository";
import { DrizzleAuthorsRepository } from "@/infrastructure/repositories/AuthorsRepository";
import ArticleView from "@/components/ArticleView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://passgoal.com";

// Open Graph + Twitter Card tags — required for Google Discover to ever
// surface an article (needs a large image, title, description at minimum)
// and for links to render properly when shared.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await new DrizzleArticlesRepository().findBySlug(slug);
  if (!article) return {};

  const url = `${SITE_URL}/articles/${article.slug}`;

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url,
      type: "article",
      images: article.imageOneUrl ? [{ url: article.imageOneUrl, width: 1200, height: 630 }] : [],
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
      images: article.imageOneUrl ? [article.imageOneUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articlesRepo = new DrizzleArticlesRepository();
  const article = await articlesRepo.findBySlug(slug);

  if (!article || !article.publishedAt) {
    notFound();
  }

  let match = null;
  if (article.linkedMatchId) {
    const allMatches = await new DrizzleMatchesRepository().findAll();
    match = allMatches.find((m) => m.id === article.linkedMatchId) ?? null;
  }

  let authorSlug: string | null = null;
  let authorName = article.authorName;
  if (article.authorId) {
    const allAuthors = await new DrizzleAuthorsRepository().findAll();
    const author = allAuthors.find((a) => a.id === article.authorId);
    authorSlug = author?.slug ?? null;
    authorName = author?.name ?? article.authorName;
  }

  // JSON-LD structured data — NewsArticle for the article itself, plus a
  // nested SportsEvent when it's linked to a match (brief section 7).
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.metaDescription,
    image: article.imageOneUrl ? [article.imageOneUrl] : [],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "Pass Goal",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png` },
    },
    mainEntityOfPage: `${SITE_URL}/articles/${article.slug}`,
  };

  if (match) {
    jsonLd.about = {
      "@type": "SportsEvent",
      name: `${match.homeTeamId} vs ${match.awayTeamId}`,
      startDate: match.kickoffUtc,
      eventStatus:
        match.status === "finished"
          ? "https://schema.org/EventScheduled"
          : "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: match.venue, address: match.city },
    };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleView article={article} match={match} authorSlug={authorSlug} />
    </>
  );
}
