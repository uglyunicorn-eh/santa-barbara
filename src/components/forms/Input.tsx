import React from "react";
import { useFormContext, useFormState } from "react-hook-form";

import { Input as BaseInput, type InputProps as BaseInputProps } from "@/components/ui/input";
import { FormFieldContext } from "@/components/forms/FormField";

type Props = Omit<BaseInputProps, "name" | "value" | "defaultValue" | "onChange" | "onBlur"> & {
  /** Focus (and select) the input once it's shown. */
  autofocus?: boolean;
};

/** A text input registered with its FormField's field; disabled while the form submits. */
export const Input = ({ autofocus, disabled, ...rest }: Props) => {
  const { name, id, messageId, invalid, surface, size } = React.useContext(FormFieldContext);
  const { register } = useFormContext();
  const { isSubmitting } = useFormState();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { ref, ...field } = register(name);

  React.useEffect(
    () => {
      if (autofocus) {
        // After the dialog has placed its own focus.
        const timer = setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 5);
        return () => clearTimeout(timer);
      }
    },
    [autofocus],
  );

  return (
    <BaseInput
      {...field}
      id={id}
      surface={surface}
      size={size}
      aria-invalid={invalid || undefined}
      aria-describedby={messageId}
      {...rest}
      // The values are read when submitting starts, so disabling the field meanwhile doesn't drop it.
      disabled={disabled || isSubmitting}
      ref={element => {
        ref(element);
        inputRef.current = element;
      }}
    />
  );
};
