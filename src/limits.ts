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
