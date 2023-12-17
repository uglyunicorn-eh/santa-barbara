import { useField, useFormikContext } from "formik";
import React from "react";
import { Form } from "react-bulma-components";
import type { Color, ElementProps, Size } from "react-bulma-components/src/components";

import { FormFieldContext } from "src/components/forms";

interface InputProps<T> {
  size?: Size;
  color?: Color;
  readOnly?: boolean;
  isStatic?: boolean;
  status?: 'focus' | 'hover';
  value?: T;
  autofocus?: boolean;
}

type Props<TValue> = Omit<
  InputProps<TValue> & ElementProps<InputProps<TValue>, 'input'>,
  'renderAs' | 'readonly'
>

export const Input = function <TValue>({
  autofocus,
  disabled,
  ...rest
}: Props<TValue>) {
  const inputRef = React.useRef(null);

  const { name } = React.useContext(FormFieldContext);
  const [field,] = useField({ name });
  const { isSubmitting } = useFormikContext();

  React.useEffect(
    () => {
      if (autofocus) {
        setTimeout(() => {
          if (inputRef.current) {
            (inputRef.current as any).focus();
            (inputRef.current as any).select();
          }
        }, 5);
      }
    },
    [
      autofocus,
    ],
  )

  return (
    <Form.Input {...field} {...rest} disabled={disabled || isSubmitting} domRef={inputRef} />
  )
};
