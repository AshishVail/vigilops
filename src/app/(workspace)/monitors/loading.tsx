import { Skeleton } from "@/components/ui/skeleton";
export default function MonitorsLoading() {
  return <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8"><Skeleton className="h-10 w-48"/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0,1,2].map((item)=><Skeleton key={item} className="h-44"/>)}</div></div>;
}
