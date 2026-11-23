import { Skeleton } from "@/components/ui/skeleton";
export default function SecurityScanDetailLoading() {
  return <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8"><Skeleton className="h-16 w-72"/><Skeleton className="h-64"/><Skeleton className="h-72"/></div>;
}
