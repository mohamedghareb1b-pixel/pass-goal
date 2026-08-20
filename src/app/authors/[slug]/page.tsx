import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DrizzleAuthorsRepository } from "@/infrastructure/repositories/AuthorsRepository";
import { DrizzleArticlesRepository } from "@/infrastructure/repositories/ArticlesRepository";

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const authorsRepo = new DrizzleAuthorsRepository();
  const author = await authorsRepo.findBySlug(params.slug);
  if (!author) notFound();

  const articlesRepo = new DrizzleArticlesRepository();
  const allArticles = await articlesRepo.findAll();
  const authorArticles = allArticles
    .filter((a) => a.authorId === author.id && a.publishedAt)
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());

  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-center gap-4 mb-8">
        {author.avatarUrl && (
          <Image src={author.avatarUrl} alt={author.name} width={72} height={72} className="rounded-full object-cover" />
        )}
        <div>
          <h1 className="font-display text-2xl">{author.name}</h1>
          {author.bio && <p className="text-sm text-ink-soft mt-1">{author.bio}</p>}
        </div>
      </div>

      <h2 className="font-mono text-xs uppercase tracking-wider text-ink-soft mb-4">
        Articles by {author.name}
      </h2>

      <div className="space-y-4">
        {authorArticles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block bg-paper border border-line rounded-xl px-4 py-3 hover:shadow-md transition-shadow"
          >
            <p className="font-medium text-sm">{article.title}</p>
          </Link>
        ))}
        {authorArticles.length === 0 && (
          <p className="text-sm text-ink-soft">No published articles yet.</p>
        )}
      </div>
    </main>
  );
}
