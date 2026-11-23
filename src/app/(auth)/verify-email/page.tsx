export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl border border-violet-500/40 bg-violet-500/10 text-violet-300">@</div>
      <h1 className="text-3xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">Check your inbox for a confirmation link. After verification, return here to sign in and create your first workspace.</p>
      <a href="/login" className="mt-8 inline-flex rounded-lg border border-[#1F2633] bg-[#0E121A] px-4 py-2.5 text-sm font-medium transition hover:border-slate-600">Return to sign in</a>
    </div>
  );
}
