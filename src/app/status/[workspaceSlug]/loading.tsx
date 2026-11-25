import { Skeleton } from "@/components/ui/skeleton";
export default function PublicStatusLoading() {
  return <div className="min-h-screen bg-white p-8"><div className="mx-auto max-w-5xl space-y-5"><Skeleton className="h-20"/><Skeleton className="h-32"/><Skeleton className="h-32"/><Skeleton className="h-64"/></div></div>;
}
