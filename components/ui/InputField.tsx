import { FormError, FormLabel } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

type InputFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  min?: number;
  className?: string;
};

/**
 * InputField — a reusable labeled input used in forms and search cards.
 *
 * Controlled component: the parent owns the value via `value` and `onChange`.
 */
export function InputField({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  min,
  className,
}: InputFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <FormLabel htmlFor={id} required={required}>
        {label}
      </FormLabel>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 motion-safe:transition-all motion-safe:duration-200 focus:outline-none focus:ring-2 sm:text-sm",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 motion-safe:hover:border-slate-300 focus:border-brand-700 focus:ring-brand-100",
        )}
      />
      {error && <FormError id={`${id}-error`} message={error} />}
    </div>
  );
}
