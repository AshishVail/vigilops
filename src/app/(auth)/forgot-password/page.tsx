"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const redirectTo = new URL("/reset-password", process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin).toString();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) setError(resetError.message);
    else setMessage("If an account exists for that email, a password reset link has been sent.");
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-2 text-sm text-slate-400">Enter your account email to receive a secure reset link.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm text-slate-300">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-[#1F2633] bg-[#0E121A] px-3 py-2.5 outline-none focus:border-violet-500" /></label>
        {message && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>}
        {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
        <button className="w-full rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white">Send reset link</button>
      </form>
      <a href="/login" className="mt-5 block text-sm text-slate-400 hover:text-slate-200">Back to sign in</a>
    </div>
  );
}
