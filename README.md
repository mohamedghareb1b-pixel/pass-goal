# Pass Goal — Project Scaffold

بسم الله. نقطة بداية حقيقية للمشروع، مبنية بمنطق TrendSphere (Clean Architecture) من الصفر.

## اللي اتبنى في النسخة دي

- **Next.js App Router + TypeScript + Tailwind** — إعداد كامل جاهز للتشغيل بعد `npm install`.
- **Drizzle ORM schema** (`src/infrastructure/db/schema.ts`) — جداول: `teams` (مرجعية ثابتة)، `matches`، `articles`، `categories`، `newsletter_subscribers`، `affiliate_settings`.
- **Domain layer** (`src/domain/entities`) — `Match` (مع منطق ظهور رابط التذكرة `isTicketLinkVisible` ومعدل السحب `pollTier`)، `Team`، `Article`.
- **Application layer** (`src/application/use-cases`) — `getFilteredMatches` (منطق فلترة البحث بالتاريخ أو اسم الفريق + الافتراضي إمبارح/النهارده/بكره)، `compressAndStoreImage` (تحويل webp تلقائي عبر sharp).
- **PWA:** `manifest.json` + `sw.js` + تسجيل تلقائي في الـ layout — installable من أول يوم.
- **صفحة Fixtures** (`/fixtures`) — الفلتر بار + الكروت التلاتة (live/upcoming/finished) حسب التصميم المتفق عليه.
- **ArticleView component** — بيفرض ترتيب العناصر الثابت من البريف (توجلز → عنوان صغير → صورة1 → Quick Answer → نص1 → تذكرة → صورة2 → نشرة بريدية → نص2 → FAQ).
- **NewsletterInlinePrompt** — منطق الإخفاء 4 أيام عبر localStorage.
- **ReadingModeToggle / BackgroundMusicToggle** — إيموجي بس، بدون نص.
- **Admin auth بباسورد** — middleware + `/admin/login` + API route، محمي بـ `ADMIN_PASSWORD`.
- **صفحات ثابتة:** About, Contact, Privacy.
- **Newsletter API route** متصلة بقاعدة البيانات.

## اللي اتبنى في النسخة دي (محدّثة — الجزء التاني)

بالإضافة لكل اللي فات، دلوقتي مبني كمان:

- **لوحة الأدمن كاملة تعمل فعليًا:**
  - `/admin/matches` — Matches Management: جدول كل المباريات المتزامنة، مع خانة Ticket Link تتعدل يدويًا (متعطلة تلقائيًا لأي ماتش مش `upcoming`).
  - `/admin/articles` + `/admin/articles/new` — فورم كامل لإضافة مقال (Title, Slug, Category, Tags, Meta Title/Description, Quick Answer, صورة1، نص1، صورة2، نص2، FAQ ديناميكي، ربط بماتش).
  - `/admin/settings` — إدخال كود Impact/التتبع يدويًا.
  - رفع الصور (`/api/admin/upload-image`) بيعدي إجباريًا على `compressAndStoreImage` (تحويل WebP + ضغط عبر sharp) قبل التخزين في Supabase.
- **Sync cron** (`/api/cron/sync-matches` + `vercel.json`) — بيطبق فعليًا منطق `pollTier`: الماتشات اللي جارية أو قريبة من الكيك أوف بتتحدث كل مرة الكرون يشتغل (كل دقيقة)، والماتشات البعيدة أو المنتهية بتتحدث كل ساعة بس. الـ Sports API client لسه **stub** (`fetchPremierLeagueMatches` بيرجع array فاضية) لحد ما تختار المزوّد.
- **Repositories:** `DrizzleMatchesRepository`, `DrizzleTeamsRepository`, `DrizzleArticlesRepository` — تنفيذ فعلي لواجهات الـ use-cases فوق Drizzle.
- **حماية الكرون:** بـ `CRON_SECRET` (Bearer token في الهيدر).

## اللي اتبنى في النسخة دي (محدّثة — الجزء التالت)

- **Sports API متصل فعليًا:** اخترت **Football-Data.org** كمزوّد (Free tier بيغطي الدوري الإنجليزي، REST بسيط، من غير تكلفة لحجم المشروع ده). `FootballDataApiClient.ts` بيحول الـ status بتاعه (`IN_PLAY`/`FINISHED`/إلخ) لموديلنا (`upcoming`/`live`/`finished`) وبيتصل بالكرون الفعلي دلوقتي بدل الـ stub.
  - **ملاحظة مهمة:** ملف `teamIdMap.ts` فيه ربط بين IDs الأرقام بتاعت Football-Data والـ slugs بتاعتنا — الأرقام دي **لازم تتأكد** بأول استدعاء حقيقي لـ `GET /v4/competitions/PL/teams` بمفتاح API شغال، لأني كتبتها من معرفتي العامة مش من استدعاء فعلي.
- **بيانات الـ 20 فريق الحقيقية** (`seed/teams.ts`) — الأسماء الرسمية، الألوان، الأكواد المختصرة لكل فريق في الدوري الإنجليزي — جاهزة كـ seed script (`npm run db:seed`). روابط الشعارات (`crestUrl`) لسه placeholders لحد ما ترفع صور الشعارات الحقيقية.
- **صفحة Fixtures بقت متصلة ببيانات حقيقية** — API route جديد (`/api/matches`) بيستخدم `getFilteredMatches` الفعلي (بحث بالتاريخ/الفريق أو الـ pills)، والصفحة بقت بتجيب البيانات live بدل الـ placeholder array، ومقسّمة بعناوين أيام زي التصميم المتفق عليه.

## اللي لسه محتاج شغل

1. **تأكيد أرقام IDs في `teamIdMap.ts`** فور توفر مفتاح Football-Data API حقيقي.
2. **رفع شعارات الفرق الحقيقية** (webp) لـ Supabase Storage وتحديث `crestUrl` في `seed/teams.ts`.
3. **الأيقونات الحقيقية للـ PWA** في `/public/icons/`.
4. **تشغيل المشروع فعليًا** (`npm install && npm run db:push && npm run db:seed && npm run dev`) — محتاج بيئة عندك واتصال Supabase حقيقي.
5. **Google Indexing API** — endpoint بعد نشر كل مقال.
6. **Deploy على Vercel** + ربط الدومين + تفعيل الـ Cron من `vercel.json` (محتاج `CRON_SECRET` في env vars بتاعت Vercel).


## تشغيل محلي

```bash
npm install
cp .env.example .env.local   # وعبّي القيم
npm run db:push
npm run dev
```
