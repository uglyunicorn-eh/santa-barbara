import { useFormikContext } from "formik";

import { Button, type ButtonProps } from "@/components/ui/button";

/** The form's submit button: primary unless told otherwise, and busy while the form submits. */
export const Submit = ({ loading, variant = "primary", ...props }: Omit<ButtonProps, "type">) => {
  const { isSubmitting } = useFormikContext();
  return (
    <Button type="submit" variant={variant} {...props} loading={loading || isSubmitting} />
  );
};
