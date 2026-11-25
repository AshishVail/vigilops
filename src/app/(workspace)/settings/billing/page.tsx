import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BillingSettingsPage() {
  const limits = [
    { label: "Monitors", value: "25 per workspace", progress: 0 },
    { label: "Minimum interval", value: "5 minutes", progress: 100 },
    { label: "Check timeout", value: "10 seconds", progress: 100 },
    { label: "Response body", value: "1 MB maximum", progress: 100 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-700">Plan</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Usage &amp; limits</h1></div>
        <Badge variant="success">Free tier</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>VigilOps Free</CardTitle><CardDescription>Production features remain available within the free-tier platform limits.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {limits.map((limit) => (
            <div key={limit.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between"><p className="text-sm text-slate-600">{limit.label}</p><p className="font-mono text-xs text-slate-800">{limit.value}</p></div>
              <Progress value={limit.progress} className="mt-3" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Support</CardTitle><CardDescription>Questions about workspace limits or platform reliability.</CardDescription></CardHeader>
        <CardContent><a href="mailto:contact@nexovent.tech" className="text-sm text-violet-700 hover:text-violet-700">contact@nexovent.tech</a></CardContent>
      </Card>
    </div>
  );
}
