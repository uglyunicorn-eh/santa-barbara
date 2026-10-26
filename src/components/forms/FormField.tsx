import React from "react";
import { useFormContext, useFormState } from "react-hook-form";

import { cn } from "@/lib/utils";

// A form field (docs/ui-kit.md, "Form fields"): a label, the input, and a message under it. The error takes the help
// text's place in a slot as tall as the taller of the two, so an error showing up or going away never resizes the form.

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
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  const id = React.useId();
  const messageId = `${id}-message`;
  // Errors appear on the form's schedule (after leaving the field, or on submit), then update as you type.
  const error: string | undefined = getFieldState(name, formState).error?.message;
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
          {/*
            The help text and the error share one slot, both laid out in it and only one shown, so the slot is as tall
            as the taller of the two: an error replacing a two-line help text (or the other way round) doesn't change
            the form's height. A field with no help keeps one blank line.
          */}
          <div className="mt-1 grid text-sm *:col-start-1 *:row-start-1">
            <p
              id={error ? undefined : messageId}
              aria-hidden={error || !help ? true : undefined}
              className={cn(dark ? "text-zinc-300" : "text-muted-foreground", error && "invisible")}
            >
              {help ?? <>&nbsp;</>}
            </p>
            <p
              id={error ? messageId : undefined}
              aria-hidden={error ? undefined : true}
              className={cn(dark ? "text-red-200" : "text-destructive", !error && "invisible")}
            >
              {error ?? <>&nbsp;</>}
            </p>
          </div>
          {extra}
        </div>
      </div>
    </FormFieldContext.Provider>
  );
};
