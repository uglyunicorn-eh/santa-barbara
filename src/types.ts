import type { Color, Size } from "react-bulma-components/src/components";

export type User = {
  id: string;
  name: string;
};

export type Party = {
  code: string;
  name: string;
  joined: boolean;
  host: boolean;
  protected: boolean;
  closed: boolean;
  participantCount?: number;
  participants?: string[];
  target?: User;
};

export interface ButtonProps {
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
