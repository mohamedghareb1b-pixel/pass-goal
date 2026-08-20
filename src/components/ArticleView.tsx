import Image from "next/image";
import type { Article } from "@/domain/entities/Article";
import type { Match } from "@/domain/entities/Match";
import { isTicketLinkVisible } from "@/domain/entities/Match";
import ReadingModeToggle from "./ReadingModeToggle";
import BackgroundMusicToggle from "./BackgroundMusicToggle";
import NewsletterInlinePrompt from "./NewsletterInlinePrompt";

/**
 * Enforces the fixed article layout order from the brief (section 6.5):
 * toggles -> small title -> image 1 -> quick answer -> body part 1 ->
 * internal ticket link -> image 2 -> body part 2 -> FAQ, with the
 * newsletter prompt placed right after image 2.
 */
export default function ArticleView({
  article,
  match,
  authorSlug,
}: {
  article: Article;
  match?: Match | null;
  authorSlug?: string | null;
}) {
  const showTicket = match ? isTicketLinkVisible(match) : false;
  const pinnedResult = match?.status === "finished" && match.score;

  const byline = (
    <div className="flex items-center gap-2 mb-5 text-sm text-ink-soft">
      <Image src={article.authorAvatarUrl} alt={article.authorName} width={28} height={28} className="rounded-full" />
      <div className="leading-tight">
        <p>{article.authorName}</p>
        {article.publishedAt && (
          <p className="text-xs text-ink-soft/80 font-mono">
            {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
              new Date(article.publishedAt)
            )}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <article className="max-w-2xl mx-auto px-5 py-7">
      <div className="flex items-center gap-2 mb-4">
        <ReadingModeToggle />
        <BackgroundMusicToggle src="/audio/ambient-reading.mp3" />
      </div>

      <h1 className="font-display text-[22px] sm:text-[26px] leading-tight mb-4">{article.title}</h1>

      {authorSlug ? (
        <a href={`/authors/${authorSlug}`} className="hover:opacity-80">
          {byline}
        </a>
      ) : (
        byline
      )}

      <Image
        src={article.imageOneUrl}
        alt={article.title}
        width={800}
        height={450}
        className="rounded-xl w-full h-auto mb-5"
      />

      <div className="bg-chalk border border-line rounded-xl p-4 mb-6">
        <p className="font-mono text-xs uppercase text-pitch-bright font-bold mb-1.5">Quick answer</p>
        <p className="text-sm">{article.quickAnswer}</p>
      </div>

      <div className="prose prose-sm max-w-none mb-5" dangerouslySetInnerHTML={{ __html: article.bodyPartOne }} />

      {pinnedResult && (
        <div className="font-mono text-xs bg-gold/20 border border-gold rounded-lg px-3 py-2 mb-5 inline-flex items-center gap-1.5">
          📌 FINAL — {match!.score!.home} - {match!.score!.away}
        </div>
      )}

      {showTicket && (
        <p className="text-sm mb-6">
          للحصول على تذاكر:{" "}
          <a
            href={match!.ticketUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 font-bold text-pitch"
          >
            اضغط هنا
          </a>
        </p>
      )}

      <Image
        src={article.imageTwoUrl}
        alt={`${article.title} — image 2`}
        width={800}
        height={450}
        className="rounded-xl w-full h-auto mb-2"
      />

      <NewsletterInlinePrompt />

      <div className="prose prose-sm max-w-none mb-8" dangerouslySetInnerHTML={{ __html: article.bodyPartTwo }} />

      {article.faq.length > 0 && (
        <section>
          <h2 className="font-display text-lg mb-4">Frequently asked questions</h2>
          <div className="space-y-4">
            {article.faq.map((item, i) => (
              <div key={i} className="border-b border-line pb-4">
                <p className="font-semibold mb-1.5">{item.question}</p>
                <p className="text-sm text-ink-soft">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
