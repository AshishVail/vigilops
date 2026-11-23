import type { AlertDelivery } from "@/lib/types/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AlertDeliveryLog({ deliveries }: { deliveries: AlertDelivery[] }) {
  return (
    <div className="rounded-xl border border-[#1F2633] bg-[#0E121A]">
      <Table>
        <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Status</TableHead><TableHead>Attempted</TableHead><TableHead>Error</TableHead></TableRow></TableHeader>
        <TableBody>{deliveries.map((delivery)=><TableRow key={delivery.id}><TableCell className="font-mono text-xs">{delivery.event_type}</TableCell><TableCell><Badge variant={delivery.status==="succeeded"?"success":delivery.status==="failed"?"danger":"default"}>{delivery.status}</Badge></TableCell><TableCell className="font-mono text-xs">{new Date(delivery.attempted_at).toLocaleString()}</TableCell><TableCell className="max-w-[300px] truncate text-slate-500">{delivery.error_message ?? "—"}</TableCell></TableRow>)}</TableBody>
      </Table>
      {deliveries.length===0&&<p className="py-10 text-center text-sm text-slate-500">No delivery activity yet.</p>}
    </div>
  );
}
