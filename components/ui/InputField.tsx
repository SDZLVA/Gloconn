import { cn } from "@/lib/utils";

type InputFieldProps = {
  /** Matches the input's `id` — links the label to the field for accessibility. */
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  className?: string;
};

/**
 * InputField — a labeled text input used in forms and search cards.
 *
 * This is UI only for now; wiring up search logic comes in a later task.
 */
export function InputField({
  id,
  label,
  placeholder,
  type = "text",
  className,
}: InputFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        readOnly
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-50"
        aria-readonly="true"
      />
    </div>
  );
}
