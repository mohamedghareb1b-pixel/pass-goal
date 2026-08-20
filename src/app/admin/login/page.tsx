"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-chalk font-body">
      <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-2xl p-8 w-full max-w-sm">
        <h1 className="font-display text-xl mb-6 text-ink">Pass Goal Admin</h1>
        <label className="block text-sm text-ink-soft mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 mb-4"
          autoFocus
        />
        {error && <p className="text-live text-sm mb-4">{error}</p>}
        <button type="submit" className="w-full bg-purple text-white rounded-lg py-2 font-semibold">
          Sign in
        </button>
      </form>
    </div>
  );
}
