import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-5 lg:p-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0,1,2,3].map((item)=><Skeleton key={item} className="h-28" />)}</div>
      <div className="grid gap-4 xl:grid-cols-2">{[0,1].map((item)=><Skeleton key={item} className="h-[340px]" />)}</div>
    </div>
  );
}
