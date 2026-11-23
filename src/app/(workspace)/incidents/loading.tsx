import { Skeleton } from "@/components/ui/skeleton";
export default function IncidentsLoading() {
  return <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8"><Skeleton className="h-10 w-48"/><div className="grid gap-4 lg:grid-cols-2">{[0,1,2,3].map((item)=><Skeleton key={item} className="h-44"/>)}</div></div>;
}
