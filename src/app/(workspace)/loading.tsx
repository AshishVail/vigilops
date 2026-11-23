import { Skeleton } from "@/components/ui/skeleton";
export default function WorkspaceLoading() {
  return <div className="space-y-5 p-5 lg:p-8"><Skeleton className="h-8 w-56" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[0,1,2,3].map((item)=><Skeleton key={item} className="h-28" />)}</div><Skeleton className="h-80" /></div>;
}
