/**
 * Size limits for what users type. The API enforces the same numbers (santa-monica's src/api/limits.ts), so keep
 * them in sync.
 */

/** Person and party names. */
export const MAX_NAME_LENGTH = 100;
/** Secret phrases. */
export const MAX_PHRASE_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 128;
/** New parties have 8-letter codes; older ones keep their 5 letters. */
export const MAX_PARTY_CODE_LENGTH = 8;
