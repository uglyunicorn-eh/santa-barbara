import { useField } from "formik";
import React from "react";
import { Form } from "src/components/bulma";

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
          {/* One message line, always there: the error takes the help's place, or a blank line when there's no help,
              so an error showing up doesn't push the rest of the form down. */}
          {meta.error && meta.touched
            ? <Form.Help color="danger">{meta.error}</Form.Help>
            : <Form.Help aria-hidden={help ? undefined : true}>{help ?? <>&nbsp;</>}</Form.Help>}
          {extra}
        </Form.Field.Body>
      </Form.Field>
    </FormFieldContext.Provider>
  );
};
