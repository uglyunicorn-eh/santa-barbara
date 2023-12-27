import { useField } from "formik";
import React from "react";
import { Form } from "react-bulma-components";

type Props = {
  name: string;
  label?: string;
  children?: React.ReactNode;
  help?: React.ReactNode;
  extra?: React.ReactNode;
  horizontal?: boolean;
};

type FormFieldContextType = {
  name: string;
}

export const FormFieldContext = React.createContext<FormFieldContextType>({ name: "" });

export const FormField = ({ name, label, children, help, extra, horizontal = true }: Props) => {
  const [, meta,] = useField(name);

  return (
    <FormFieldContext.Provider value={{ name }}>
      <Form.Field horizontal={horizontal}>
        {horizontal
          ? (
            <Form.Label>{label ?? <>&nbsp;</>}</Form.Label>
          )
          : (
            <>{label && <Form.Label>{label}</Form.Label>}</>

          )}
        <Form.Field.Body>
          <Form.Control>
            {children}
          </Form.Control>
          {meta.error && meta.touched && (
            <Form.Help color="danger">
              {meta.error}
            </Form.Help>
          )}
          {help && (
            <Form.Help>
              {help}
            </Form.Help>
          )}
          {extra}
        </Form.Field.Body>
      </Form.Field>
    </FormFieldContext.Provider>
  );
};
