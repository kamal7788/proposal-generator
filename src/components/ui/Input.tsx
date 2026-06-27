import { cn } from "@/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-brand-black mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 border border-brand-border rounded-lg text-sm",
          "bg-white text-brand-black placeholder:text-brand-neutral-light",
          "focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green",
          "transition-colors duration-200",
          error && "border-brand-danger focus:ring-brand-danger/20 focus:border-brand-danger",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
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
        <label className="block text-sm font-medium text-brand-black mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-3 py-2 border border-brand-border rounded-lg text-sm resize-y min-h-[80px]",
          "bg-white text-brand-black placeholder:text-brand-neutral-light",
          "focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green",
          "transition-colors duration-200",
          error && "border-brand-danger focus:ring-brand-danger/20 focus:border-brand-danger",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
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
        <label className="block text-sm font-medium text-brand-black mb-1.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full px-3 py-2 border border-brand-border rounded-lg text-sm",
          "bg-white text-brand-black",
          "focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green",
          "transition-colors duration-200",
          error && "border-brand-danger",
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
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
    </div>
  );
}
