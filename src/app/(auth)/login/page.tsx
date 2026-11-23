"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.replace(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  async function signInWithGitHub() {
    setError("");
    const callbackUrl = new URL("/auth/callback", process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: callbackUrl.toString() },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 lg:hidden">
        <Link href="/" className="flex items-center gap-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-500/40 bg-violet-500/10 text-violet-300">V</span>VigilOps</Link>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in to your VigilOps workspace.</p>
      <form onSubmit={signIn} className="mt-8 space-y-4">
        <label className="block text-sm text-slate-300">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-[#1F2633] bg-[#0E121A] px-3 py-2.5 outline-none transition focus:border-violet-500" /></label>
        <label className="block text-sm text-slate-300">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-[#1F2633] bg-[#0E121A] px-3 py-2.5 outline-none transition focus:border-violet-500" /></label>
        {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
      </form>
      <button onClick={signInWithGitHub} className="mt-3 w-full rounded-lg border border-[#1F2633] bg-[#0E121A] px-4 py-2.5 text-sm font-medium transition hover:border-slate-600">Continue with GitHub</button>
      <div className="mt-5 flex justify-between text-sm">
        <a href="/forgot-password" className="text-slate-400 hover:text-slate-200">Forgot password?</a>
        <a href="/signup" className="text-violet-300 hover:text-violet-200">Create account</a>
      </div>
    </div>
  );
}
