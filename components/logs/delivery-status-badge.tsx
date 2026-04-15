import { cn } from "@/lib/utils/cn";

type Props = {
  status: "queued" | "sent" | "failed";
};

const labelMap: Record<Props["status"], string> = {
  queued: "Σε ουρά",
  sent: "Στάλθηκε",
  failed: "Απέτυχε",
};

export function DeliveryStatusBadge({ status }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        status === "queued" && "bg-slate-100 text-slate-700",
        status === "sent" && "bg-green-100 text-green-700",
        status === "failed" && "bg-red-100 text-red-700"
      )}
    >
      {labelMap[status]}
    </span>
  );
}