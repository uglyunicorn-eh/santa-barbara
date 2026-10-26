import { useField, useFormikContext } from "formik";
import React from "react";

import { Input as BaseInput, type InputProps as BaseInputProps } from "@/components/ui/input";
import { FormFieldContext } from "src/components/forms/FormField";

type Props = Omit<BaseInputProps, "name" | "value" | "onChange" | "onBlur"> & {
  /** Focus (and select) the input once it's shown. */
  autofocus?: boolean;
};

/** A text input bound to its FormField's Formik field; disabled while the form submits. */
export const Input = ({ autofocus, disabled, ...rest }: Props) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { name, id, messageId, invalid, surface, size } = React.useContext(FormFieldContext);
  const [field] = useField({ name });
  const { isSubmitting } = useFormikContext();

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
      disabled={disabled || isSubmitting}
      ref={inputRef}
    />
  );
};
