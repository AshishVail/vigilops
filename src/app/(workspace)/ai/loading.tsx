import { Skeleton } from "@/components/ui/skeleton";
export default function AiLoading() {
  return <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8"><Skeleton className="h-10 w-56"/><div className="grid gap-5 xl:grid-cols-[380px_1fr]"><Skeleton className="h-96"/><Skeleton className="h-96"/></div></div>;
}
