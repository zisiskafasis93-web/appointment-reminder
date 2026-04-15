import { cn } from "@/lib/utils/cn";

type Props = {
  status: "scheduled" | "cancelled" | "completed";
};

const labelMap: Record<Props["status"], string> = {
  scheduled: "Προγραμματισμένο",
  cancelled: "Ακυρωμένο",
  completed: "Ολοκληρωμένο",
};

export function AppointmentStatusBadge({ status }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        status === "scheduled" && "bg-amber-100 text-amber-700",
        status === "cancelled" && "bg-red-100 text-red-700",
        status === "completed" && "bg-green-100 text-green-700"
      )}
    >
      {labelMap[status]}
    </span>
  );
}