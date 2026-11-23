import { Skeleton } from "@/components/ui/skeleton";

export default function ObservatoryLoading() {
  return <div className="grid h-[calc(100vh-64px)] grid-cols-[220px_minmax(0,1fr)_220px]"><Skeleton className="h-full rounded-none"/><div className="p-5"><Skeleton className="h-10"/><Skeleton className="mt-5 h-[520px]"/></div><Skeleton className="h-full rounded-none"/></div>;
}
