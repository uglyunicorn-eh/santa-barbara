export type User = {
  id: string;
  name: string;
  /** Only for the signed-in user. */
  email?: string | null;
  /** When the account was made (ISO 8601). Only for the signed-in user; older API versions leave it out. */
  joinedAt?: string;
  /** Parties the user is in, how many rolled, how many they host. Only from the profile (GET and PATCH /v1/me). */
  parties?: PartyCounts;
};

/** The profile's party counts: deleted parties don't count. */
export type PartyCounts = {
  joined: number;
  rolled: number;
  hosted: number;
};

/** A party as the API returns it. Parties are identified by their code. */
export type Party = {
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
  /** The host's secret phrase, for the host only. */
  password?: string | null;
  /** Only for members. */
  participantCount?: number | null;
  participants?: string[] | null;
  /** When the party is due (ISO 8601), if the host set one: the party page counts down to it. */
  dueAt?: string | null;
  /** Who this person gives a gift to, once the dice are rolled: just a name. */
  target?: { name: string } | null;
};
