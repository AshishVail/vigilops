"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else router.replace("/dashboard");
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm text-slate-300">New password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-[#1F2633] bg-[#0E121A] px-3 py-2.5 outline-none focus:border-violet-500" /></label>
        <label className="block text-sm text-slate-300">Confirm password<input required minLength={8} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-lg border border-[#1F2633] bg-[#0E121A] px-3 py-2.5 outline-none focus:border-violet-500" /></label>
        {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
        <button className="w-full rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white">Update password</button>
      </form>
    </div>
  );
}
