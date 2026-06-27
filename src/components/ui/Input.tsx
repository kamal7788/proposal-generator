import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-medium text-on-surface mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            {icon}
          </span>
        )}
        <input
          className={cn(
            "w-full px-3 py-2 border border-[#c3cdd8] rounded-lg text-[13px]",
            "bg-white text-on-surface placeholder:text-on-surface-variant/50",
            "focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]",
            "transition-colors duration-150",
            icon && "pl-10",
            error && "border-[#dc2626] focus:ring-[#dc2626]/15 focus:border-[#dc2626]",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#dc2626]">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-medium text-on-surface mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-3 py-2 border border-[#c3cdd8] rounded-lg text-[13px] resize-y min-h-[80px]",
          "bg-white text-on-surface placeholder:text-on-surface-variant/50",
          "focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]",
          "transition-colors duration-150",
          error && "border-[#dc2626] focus:ring-[#dc2626]/15 focus:border-[#dc2626]",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#dc2626]">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-medium text-on-surface mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full px-3 py-2 border border-[#c3cdd8] rounded-lg text-[13px]",
          "bg-white text-on-surface",
          "focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]",
          "transition-colors duration-150",
          error && "border-[#dc2626]",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[#dc2626]">{error}</p>}
    </div>
  );
}
