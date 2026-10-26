import { useFormState } from "react-hook-form";

import { Button, type ButtonProps } from "@/components/ui/button";

/** The form's submit button: spins (and can't be pressed again) while the form submits. */
export const Submit = ({ loading, variant = "primary", ...props }: Omit<ButtonProps, "type">) => {
  const { isSubmitting } = useFormState();
  return <Button type="submit" variant={variant} {...props} loading={loading || isSubmitting} />;
};
