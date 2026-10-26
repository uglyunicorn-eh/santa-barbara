import { useField } from "formik";
import React from "react";

import { cn } from "@/lib/utils";

// A form field (docs/ui-kit.md, "Form fields"): a label, the input, and one message line under it. The error takes the
// help text's place, and a field with no help keeps the line blank, so an error showing up doesn't push the form down.

type Surface = "light" | "dark";
type Size = "md" | "lg";

type Props = {
  name: string;
  label?: string;
  children?: React.ReactNode;
  help?: React.ReactNode;
  extra?: React.ReactNode;
  /** The label beside the input from tablet width up (the dialogs); otherwise above it. */
  horizontal?: boolean;
  /** "dark" on the glass cards (sign-in, join). */
  surface?: Surface;
  size?: Size;
};

type FormFieldContextType = {
  name: string;
  id?: string;
  messageId?: string;
  invalid?: boolean;
  surface?: Surface;
  size?: Size;
}

export const FormFieldContext = React.createContext<FormFieldContextType>({ name: "" });

export const FormField = ({ name, label, children, help, extra, horizontal = true, surface = "light", size = "md" }: Props) => {
  const [, meta] = useField(name);
  const id = React.useId();
  const messageId = `${id}-message`;
  const error = meta.touched ? meta.error : undefined;
  const dark = surface === "dark";

  return (
    <FormFieldContext.Provider value={{ name, id, messageId, invalid: !!error, surface, size }}>
      <div className={cn("mb-4 text-left last:mb-0", horizontal && "tablet:flex tablet:gap-4")}>
        {(label || horizontal) && (
          <label
            htmlFor={id}
            className={cn(
              "mb-1 block text-base font-semibold",
              dark ? "text-zinc-300" : "text-zinc-700",
              horizontal && "tablet:mb-0 tablet:w-37.5 tablet:shrink-0 tablet:text-right",
              horizontal && (size === "lg" ? "tablet:leading-12" : "tablet:leading-10"),
            )}
          >
            {label ?? <>&nbsp;</>}
          </label>
        )}
        <div className="min-w-0 flex-1">
          {children}
          <p
            id={messageId}
            aria-hidden={!error && !help ? true : undefined}
            className={cn(
              "mt-1 text-sm",
              error ? (dark ? "text-red-200" : "text-destructive") : (dark ? "text-zinc-300" : "text-muted-foreground"),
            )}
          >
            {error ?? help ?? <>&nbsp;</>}
          </p>
          {extra}
        </div>
      </div>
    </FormFieldContext.Provider>
  );
};
