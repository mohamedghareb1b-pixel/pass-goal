import { MetadataRoute } from "next";
import { DrizzleArticlesRepository } from "@/infrastructure/repositories/ArticlesRepository";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://passgoal.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = new DrizzleArticlesRepository();
  const articles = await repo.findAll();
  const published = articles.filter((a) => a.publishedAt);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/fixtures`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/disclosure`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const articlePages: MetadataRoute.Sitemap = published.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages];
}
