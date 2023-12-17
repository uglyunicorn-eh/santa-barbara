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
}

type Props<TValue> = Omit<
  InputProps<TValue> & ElementProps<InputProps<TValue>, 'input'>,
  'renderAs' | 'readonly'
>

export const Input = function <TValue>({
  disabled,
  ...rest
}: Props<TValue>) {
  const { name } = React.useContext(FormFieldContext);
  const [field,] = useField({ name });
  const { isSubmitting } = useFormikContext();

  return (
    <Form.Input {...field} {...rest} disabled={disabled || isSubmitting} />
  )
};
