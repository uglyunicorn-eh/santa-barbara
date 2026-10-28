// Data the screenshot script's fake API answers with. Two sets: "normal" (what most parties look like) and "worst"
// (the longest values the API allows, from the plan's step 1.4), so every screen is seen at both.

/** Party codes used in the screens' URLs. Letters from the real code alphabet, 8 long like new codes. */
export const CODES = {
  hostOpen: "HOSTOPEN",
  guestOpen: "GUESTOPN",
  closed: "CLOSEDPA",
  deleted: "DELETEDP",
  notJoined: "JOINMEPL",
  protectedNotJoined: "SECRETPA",
  missing: "NOPARTYS",
  slow: "SLOWPART",
};

// The same numbers as src/limits.ts.
const PERSON_NAME_MAX = 32;
const PARTY_NAME_MAX = 48;
const EMAIL_MAX = 128;

/** Exactly `n` characters of `text`, repeated as needed. */
const fill = (text, n) => text.repeat(Math.ceil(n / text.length)).slice(0, n);

/** An address of exactly `n` characters. */
const email = (n, domain = "example.com") => `${fill("santa.helper.", n - domain.length - 1).replace(/\.$/, "x")}@${domain}`;

const iso = (daysAgo) => new Date(Date.UTC(2026, 9, 25) - daysAgo * 86_400_000).toISOString();

function makeSet({ userName, userEmail, partyName, participantName, participantCount, historyCount, rolled }) {
  const participants = Array.from({ length: participantCount }, (_, i) => participantName(i));
  const base = {
    name: partyName,
    isJoined: true,
    isHost: false,
    isProtected: false,
    isClosed: false,
    createdAt: iso(3),
    rolledAt: null,
    deletedAt: null,
    restorableUntil: null,
    password: null,
    participantCount: participants.length,
    participants,
    target: null,
  };

  const parties = {
    [CODES.hostOpen]: { ...base, code: CODES.hostOpen, isHost: true, isProtected: true, password: "mistletoe and wine" },
    [CODES.guestOpen]: { ...base, code: CODES.guestOpen },
    [CODES.closed]: { ...base, code: CODES.closed, isClosed: true, rolledAt: iso(1), target: { name: participantName(1) } },
    [CODES.deleted]: { ...base, code: CODES.deleted, isHost: true, deletedAt: iso(0), restorableUntil: new Date(Date.UTC(2026, 9, 26)).toISOString() },
    [CODES.notJoined]: { ...base, code: CODES.notJoined, isJoined: false, participantCount: null, participants: null },
    [CODES.protectedNotJoined]: { ...base, code: CODES.protectedNotJoined, isJoined: false, isProtected: true, participantCount: null, participants: null },
  };

  const history = Array.from({ length: historyCount }, (_, i) => ({
    ...base,
    code: `HIST${"QWERTYUIPASDFGHJKLZXCVBNMO"[i % 26]}${"ASDF"[i % 4]}PA`,
    name: i % 2 ? partyName : `${partyName.slice(0, Math.max(10, partyName.length - 20))} ${i + 1}`,
    isHost: i % 3 === 0,
    isProtected: i % 4 === 0,
    isClosed: i % 2 === 1,
    rolledAt: i % 2 === 1 ? iso(i + 1) : null,
    deletedAt: i === 2 ? iso(0) : null,
    restorableUntil: i === 2 ? new Date(Date.UTC(2026, 9, 26)).toISOString() : null,
    createdAt: iso(i * 30 + 3),
    participants: null,
  }));

  return {
    user: { id: "User:shots-user", name: userName, email: userEmail },
    parties,
    history,
    rolled,
  };
}

export const SETS = {
  normal: makeSet({
    userName: "Alice",
    userEmail: "alice@example.com",
    partyName: "Office Secret Santa 2026",
    participantName: (i) => ["Alice", "Bob", "Carol", "Dave", "Erin", "Frank"][i],
    participantCount: 6,
    historyCount: 3,
    rolled: 29,
  }),
  worst: makeSet({
    // The longest person name (32 characters) with ordinary words; every participant has one too.
    userName: fill("Maximiliana Wilhelmina Bartholomew-Featherstonehaugh ", PERSON_NAME_MAX).trim().padEnd(PERSON_NAME_MAX, "e"),
    userEmail: email(EMAIL_MAX),
    // The longest party name (48 characters) with no spaces at all: the hardest case for wrapping.
    partyName: fill("TheVeryLongestSecretSantaPartyNameEver", PARTY_NAME_MAX),
    participantName: (i) => `${fill("Wolfeschlegelsteinhausenbergerdorff ", PERSON_NAME_MAX - 4).trim()} ${String(i + 1).padStart(3, "0")}`.slice(0, PERSON_NAME_MAX),
    participantCount: 100,
    historyCount: 25,
    // More digits than the odometer's six.
    rolled: 123456789,
  }),
};

export const LIMITS = { PERSON_NAME_MAX, PARTY_NAME_MAX, EMAIL_MAX };
