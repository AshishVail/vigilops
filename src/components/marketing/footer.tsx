import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#1F2633]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} VigilOps</p>
        <div className="flex gap-5"><a href="mailto:contact@nexovent.tech" className="hover:text-slate-300">Contact</a><Link href="/status" className="hover:text-slate-300">Status</Link><Link href="/login" className="hover:text-slate-300">Sign in</Link></div>
      </div>
    </footer>
  );
}
