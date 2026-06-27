import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#004527] text-white hover:bg-[#006B3F] focus:ring-[#004527] shadow-sm",
    secondary:
      "bg-[#efe8db] text-[#004527] border border-[#e2d5c0] hover:bg-[#e2d5c0] focus:ring-[#004527]",
    outline:
      "border border-[#c3cdd8] text-on-surface bg-white hover:bg-surface focus:ring-[#004527]",
    ghost:
      "text-on-surface-variant hover:text-on-surface hover:bg-surface focus:ring-[#004527]",
    danger:
      "bg-[#dc2626] text-white hover:bg-red-700 focus:ring-[#dc2626]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[13px]",
    md: "px-4 py-2 text-[13px]",
    lg: "px-6 py-2.5 text-sm",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="material-symbols-outlined text-[16px] animate-spin mr-1.5">
          progress_activity
        </span>
      )}
      {children}
    </button>
  );
}
