import { useField } from "formik";
import React from "react";
import { Form } from "react-bulma-components";

type Props = {
  name: string;
  label?: string;
  children?: React.ReactNode;
  help?: React.ReactNode;
  extra?: React.ReactNode;
};

type FormFieldContextType = {
  name: string;
}

const FormFieldContext = React.createContext<FormFieldContextType>({ name: "" });

export const FormField = ({ name, label, children, help, extra }: Props) => {
  const [field, meta, helpers] = useField(name);

  return (
    <FormFieldContext.Provider value={{ name }}>
      <Form.Field horizontal>
        <Form.Label>{label ?? <>&nbsp;</>}</Form.Label>
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
