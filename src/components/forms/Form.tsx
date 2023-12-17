import { Formik, type FormikConfig, type FormikValues } from "formik";

type Props<Values extends FormikValues> = {
  children?: React.ReactNode;
} & FormikConfig<Values>;

export const Form = function <Values extends FormikValues>({
  children,
  ...rest
}: Props<Values>) {
  return (
    <Formik {...rest}>
      {props => (
        <form method="POST" onSubmit={props.handleSubmit}>
          {children}
        </form>
      )}
    </Formik>
  );
}
