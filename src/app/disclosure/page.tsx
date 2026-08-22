export default function DisclosurePage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl mb-4">Affiliate Disclosure</h1>
      <div className="text-sm text-ink-soft leading-relaxed space-y-4">
        <p>
          Pass Goal participates in affiliate partnerships, including with TicketNetwork.
          When you click a &quot;Get tickets&quot; link on a fixture or article and make a purchase,
          we may earn a commission at no additional cost to you.
        </p>
        <p>
          These partnerships do not influence our editorial coverage, match analysis, or
          fixture data — ticket links are the only commercial element on the site, and they
          are clearly labelled wherever they appear.
        </p>
        <p>
          If you have questions about this disclosure, you can reach us on the{" "}
          <a href="/contact" className="underline text-pitch font-medium">
            Contact us
          </a>{" "}
          page.
        </p>
      </div>
    </main>
  );
}
