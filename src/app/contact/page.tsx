export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-2xl mb-4">Contact us</h1>
      <p className="text-sm text-ink-soft leading-relaxed">
        Questions or feedback? Reach us at{" "}
        <a href="mailto:hello@passgoal.com" className="underline">
          hello@passgoal.com
        </a>
        .
      </p>
    </main>
  );
}
