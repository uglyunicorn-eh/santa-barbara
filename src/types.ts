import type { Color, Size } from "react-bulma-components/src/components";

export type User = {
  id: string;
  name: string;
  /** Only for the signed-in user. */
  email?: string | null;
};

export type Party = {
  id: string;
  code: string;
  name: string;
  isJoined: boolean;
  isHost: boolean;
  isProtected: boolean;
  isClosed: boolean;
  /** ISO 8601. */
  createdAt?: string;
  /** ISO 8601; when the dice were rolled. Unknown for parties rolled before it was recorded. */
  rolledAt?: string | null;
  /** Set when the host deleted the party (ISO 8601). Only the host still sees it. */
  deletedAt?: string | null;
  /** Until when the host can restore it (ISO 8601). */
  restorableUntil?: string | null;
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
