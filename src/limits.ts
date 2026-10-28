/**
 * Size limits for what users type. The API enforces the same numbers (santa-monica's src/api/limits.ts), so keep
 * them in sync.
 */

/** A person's name (in their profile, and the name they join a party with). */
export const MAX_PERSON_NAME_LENGTH = 32;
/** A party's name. */
export const MAX_PARTY_NAME_LENGTH = 48;
/** Secret phrases. */
export const MAX_PHRASE_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 128;
/** New parties have 8-letter codes; older ones keep their 5 letters. */
export const MAX_PARTY_CODE_LENGTH = 8;
/** A party's due time: at least this far ahead when the party is made (the API's own limit, in ms)... */
export const MIN_DUE_AHEAD_MS = 60 * 60 * 1000;
/** ...and at most this far. */
export const MAX_DUE_AHEAD_MS = 366 * 24 * 60 * 60 * 1000;
/** Addresses in one invite (the API's MAX_INVITES_PER_REQUEST). */
export const MAX_INVITES_PER_REQUEST = 10;
