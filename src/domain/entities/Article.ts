/**
 * One article per match (big/high-profile matches only — see brief section 5).
 * Layout order is fixed and enforced by the ArticleView component, not by
 * free-form admin content: toggles -> title -> image1 -> quick answer ->
 * body part 1 -> internal ticket link -> image2 -> body part 2 -> FAQ.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string; // rendered at a deliberately small, mobile-first size
  authorName: string; // defaults to "Shindy"
  authorAvatarUrl: string;
  authorId?: string | null;
  categoryId: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  quickAnswer: string;
  imageOneUrl: string; // webp, compressed on upload
  imageTwoUrl: string; // webp, compressed on upload
  bodyPartOne: string; // rich text / markdown
  bodyPartTwo: string;
  faq: FaqItem[];
  linkedMatchId?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
