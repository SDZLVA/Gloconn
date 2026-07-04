import { cn } from "@/lib/utils";
import { formError } from "@/lib/styles";

type FormErrorProps = {
  id?: string;
  message: string;
};

/** FormError — shows a validation message below a form field. */
export function FormError({ id, message }: FormErrorProps) {
  return (
    <p id={id} className={formError} role="alert">
      {message}
    </p>
  );
}

type FormLabelProps = {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

/**
 * FormLabel — shared label styling for inputs and fieldsets.
 * Shows a red asterisk and screen-reader text when `required` is true.
 */
export function FormLabel({
  htmlFor,
  required = false,
  children,
  className,
}: FormLabelProps) {
  const labelClassName = cn(
    "text-sm font-semibold tracking-wide text-slate-800",
    className,
  );

  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={labelClassName}>
        {children}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
    );
  }

  return (
    <legend className={labelClassName}>
      {children}
      {required && (
        <span className="text-red-500" aria-hidden="true">
          {" "}
          *
        </span>
      )}
      {required && <span className="sr-only"> (required)</span>}
    </legend>
  );
}
