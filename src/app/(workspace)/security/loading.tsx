import { Skeleton } from "@/components/ui/skeleton";
export default function SecurityLoading() {
  return <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8"><Skeleton className="h-10 w-48"/><Skeleton className="h-32"/><Skeleton className="h-64"/></div>;
}
