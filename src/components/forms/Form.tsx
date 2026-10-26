import { Formik, type FormikConfig, type FormikValues } from "formik";

type Props<Values extends FormikValues> = {
  children?: React.ReactNode;
  className?: string;
} & FormikConfig<Values>;

export const Form = function <Values extends FormikValues>({
  children,
  className,
  ...rest
}: Props<Values>) {
  return (
    <Formik {...rest}>
      {props => (
        <form method="POST" onSubmit={props.handleSubmit} className={className}>
          {children}
        </form>
      )}
    </Formik>
  );
}
