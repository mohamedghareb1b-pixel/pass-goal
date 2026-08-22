import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-chalk font-body">
      <header className="bg-purple text-white px-6 py-4 flex items-center gap-6">
        <span className="font-display text-sm">Pass Goal Admin</span>
        <nav className="flex gap-5 text-sm">
          <Link href="/admin/matches" className="hover:underline">
            Matches
          </Link>
          <Link href="/admin/articles" className="hover:underline">
            Articles
          </Link>
          <Link href="/admin/categories" className="hover:underline">
            Categories
          </Link>
          <Link href="/admin/authors" className="hover:underline">
            Authors
          </Link>
          <Link href="/admin/settings" className="hover:underline">
            Settings
          </Link>
        </nav>
        <form action="/api/admin/logout" method="POST" className="ml-auto">
          <button className="text-sm opacity-75 hover:opacity-100">Sign out</button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
