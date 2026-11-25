"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: new URL("/auth/callback", process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin).toString(),
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    router.replace("/verify-email");
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Start monitoring, testing, and securing services.</p>
      <form onSubmit={signUp} className="mt-8 space-y-4">
        <label className="block text-sm text-slate-600">Full name<input required minLength={2} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-violet-500" /></label>
        <label className="block text-sm text-slate-600">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-violet-500" /></label>
        <label className="block text-sm text-slate-600">Password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-violet-500" /></label>
        {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="mt-5 text-sm text-slate-600">Already have an account? <a href="/login" className="text-violet-700 hover:text-violet-700">Sign in</a></p>
    </div>
  );
}
