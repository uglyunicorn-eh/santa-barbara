import { useFormikContext } from "formik";
import { Button } from "react-bulma-components";
import type { Color, Size } from "react-bulma-components/src/components";

interface ButtonProps {
  color?: Color
  | 'ghost'
  | 'black-bis'
  | 'black-ter'
  | 'white-bis'
  | 'white-ter'
  | 'grey-darker'
  | 'grey-dark'
  | 'grey-light'
  | 'grey-lighter';
  size?: Size;
  state?: 'hover' | 'focus' | 'active';
  outlined?: boolean;
  inverted?: boolean;
  submit?: boolean;
  reset?: boolean;
  loading?: boolean;
  fullwidth?: boolean;
  disabled?: boolean;
  remove?: boolean;
  isSelected?: boolean;
  isStatic?: boolean;
  rounded?: boolean;
  text?: boolean;
}

type Props = {
  children?: React.ReactNode;
} & ButtonProps;

export const Submit = (props: Props) => {
  const { isSubmitting } = useFormikContext();
  return (
    <Button type="submit" color="primary" {...props} loading={isSubmitting} />
  );
};
