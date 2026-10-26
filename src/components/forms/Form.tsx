import { valibotResolver } from "@hookform/resolvers/valibot";
import React from "react";
import { FormProvider, useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import type * as v from "valibot";

export type FormProps<V extends FieldValues> = {
  /** The fields and their starting values. */
  defaultValues: DefaultValues<V>;
  /** Replaces the values whenever it changes (e.g. after the profile reloads). */
  values?: V;
  /** Valibot schema. It must declare every field the form submits: fields it doesn't know are dropped. */
  schema?: v.GenericSchema<V>;
  onSubmit: (values: V) => unknown | Promise<unknown>;
  /**
   * When errors appear: "onTouched" (default) after a field is left, then as you type; "onSubmit" only once the form
   * was submitted, then as you type.
   */
  mode?: "onTouched" | "onSubmit";
  className?: string;
  children?: React.ReactNode;
};

/** A form on React Hook Form, validated with Valibot. The browser's own validation stays off. */
export const Form = <V extends FieldValues>({ defaultValues, values, schema, onSubmit, mode = "onTouched", className, children }: FormProps<V>) => {
  const methods = useForm<V>({
    defaultValues,
    values,
    mode,
    reValidateMode: "onChange",
    resolver: schema ? valibotResolver(schema) : undefined,
  });

  return (
    <FormProvider {...methods}>
      <form method="POST" noValidate onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
};
