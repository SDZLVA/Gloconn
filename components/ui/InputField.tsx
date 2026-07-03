import { cn } from "@/lib/utils";

type InputFieldProps = {
  /** Matches the input's `id` — links the label to the field for accessibility. */
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
 * Pass `error` to show a validation message below the field.
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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
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
          "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
            : "border-slate-200 focus:border-brand-700 focus:ring-brand-50",
        )}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
