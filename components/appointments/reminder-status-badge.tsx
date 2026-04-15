import { cn } from "@/lib/utils/cn";

type Props = {
  status: "pending" | "processing" | "sent" | "failed" | "cancelled";
};

const labelMap: Record<Props["status"], string> = {
  pending: "Σε αναμονή",
  processing: "Σε επεξεργασία",
  sent: "Στάλθηκε",
  failed: "Απέτυχε",
  cancelled: "Ακυρώθηκε",
};

export function ReminderStatusBadge({ status }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        status === "pending" && "bg-slate-100 text-slate-700",
        status === "processing" && "bg-blue-100 text-blue-700",
        status === "sent" && "bg-green-100 text-green-700",
        status === "failed" && "bg-red-100 text-red-700",
        status === "cancelled" && "bg-zinc-200 text-zinc-700"
      )}
    >
      {labelMap[status]}
    </span>
  );
}