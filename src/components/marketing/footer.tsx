import Link from "next/link";
import { Activity } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: [
      ["Uptime monitoring", "#features"],
      ["API observatory", "#features"],
      ["Security scanner", "#security"],
      ["Public status pages", "#features"],
    ],
  },
  {
    title: "Explore",
    links: [
      ["How it works", "#how-it-works"],
      ["Architecture", "#architecture"],
      ["Frequently asked questions", "#faq"],
      ["Contact", "mailto:contact@nexovent.tech"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Sign in", "/login"],
      ["Create an account", "/signup"],
      ["Try live demo", "#demo"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white"><Activity className="h-4 w-4" /></span>
              VigilOps
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-600">Monitor. Test. Secure. Resolve. Operational clarity for teams that build and run software.</p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-900">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith("mailto:") ? <a href={href} className="text-sm text-slate-600 transition hover:text-indigo-700">{label}</a> : <Link href={href} className="text-sm text-slate-600 transition hover:text-indigo-700">{label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VigilOps. Monitor. Test. Secure. Resolve.</p>
          <p>Built for reliable operations.</p>
        </div>
      </div>
    </footer>
  );
}
