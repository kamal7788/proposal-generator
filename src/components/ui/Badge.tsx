import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "terrible" | "bad" | "okay" | "good";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-surface text-on-surface-variant border-[#c3cdd8]/50",
    success: "bg-[#15803d]/10 text-[#15803d] border-[#15803d]/20",
    warning: "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20",
    danger: "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20",
    info: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20",
    terrible: "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20",
    bad: "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20",
    okay: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20",
    good: "bg-[#15803d]/10 text-[#15803d] border-[#15803d]/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
