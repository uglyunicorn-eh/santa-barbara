import React from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { AlertCircle, Check, Clock, Edit2, Gift, Info, RotateCw, Send, Star, X } from "react-feather";
import * as v from "valibot";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/forms/Form";
import { FormFieldContext } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { Submit } from "@/components/forms/Submit";
import { maxLen, required, validEmail } from "@/components/forms/messages";
import { useNotifications } from "@/components/hoc/NotificationsContainer";
import { useAppClient, useCurrentUser, useTabletUp } from "@/components/hooks";
import type { RequestEmailChangeInput, UpdateNameInput } from "@/components/hooks/useAppClient";
import type { Party, PartyCounts } from "@/types";
import { MAX_EMAIL_LENGTH, MAX_PERSON_NAME_LENGTH } from "@/limits";
import { cn } from "@/lib/utils";

/**
 * The account's email as the profile shows it, so a shared screen doesn't give it away: the name's first and last
 * letters around three dots (always three, so its length doesn't show either), then the domain. "s•••r@uglyunicorn.ca".
 */
export const maskEmail = (email: string) => {
  const at = email.lastIndexOf("@");
  if (at < 1) {
    return email;
  }
  const local = email.slice(0, at);
  return `${local[0]}•••${local.length > 2 ? local.at(-1) : ""}${email.slice(at)}`;
};

/** The ranks, by how many of the person's parties rolled their dice: each takes one more party than the one before. */
const RANKS = [
  { least: 0, name: "Rookie elf" },
  { least: 1, name: "Elf" },
  { least: 3, name: "Senior elf" },
  { least: 6, name: "Director of Elves" },
  { least: 10, name: "VP of Operations" },
  { least: 15, name: "Chief Gnome Officer" },
];

const rankFor = (rolled: number) => {
  const i = RANKS.findLastIndex(rank => rolled >= rank.least);
  return { rank: RANKS[i], next: RANKS[i + 1] as typeof RANKS[number] | undefined };
};

/** Calendar days from `joined` to today where the person is: joined yesterday evening is 1 day, whatever the hour. */
const daysSince = (joined: Date) => {
  const today = new Date();
  return Math.max(0, Math.round(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
      - Date.UTC(joined.getFullYear(), joined.getMonth(), joined.getDate())) / 86_400_000,
  ));
};

/** A small stable number from a string (FNV-1a): the card's number, and each stamp's shape, ink and tilt. */
const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  }
  return h >>> 0;
};

const month = (date: Date) => date.toLocaleString("en", { month: "short" });
/** "03 Dec 2023": the card's dates, the same in every locale. */
const cardDate = (date: Date) => `${String(date.getDate()).padStart(2, "0")} ${month(date)} ${date.getFullYear()}`;

/** A line of the card's machine-readable zone: its parts joined with "<", in capitals, padded past the card's edge. */
const mrzLine = (...parts: string[]) =>
  (parts.join("<").toUpperCase().replace(/[^A-Z0-9<]+/g, "<") + "<".repeat(96)).slice(0, 96);

const nameSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty(required("Name")), v.maxLength(MAX_PERSON_NAME_LENGTH, maxLen("Name", MAX_PERSON_NAME_LENGTH))),
});

/** Rejects the current address here, so the request (and its emailing rate limit) is never spent on it. */
const emailSchema = (currentEmail: string) => v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(required("New email")),
    v.maxLength(MAX_EMAIL_LENGTH, maxLen("New email", MAX_EMAIL_LENGTH)),
    v.email(validEmail("New email")),
    v.check(value => value.toLowerCase() !== currentEmail.toLowerCase(), "That's already your email."),
  ),
});

/**
 * The Profile tab: a North Pole ID card (profile.css), in mono type. The front has a photo that keeps the person
 * anonymous (a silhouette with a black bar over the eyes) under their rank's stamp, the name and the masked email,
 * each edited right on the card, how long they've been undercover, and their rank: from how many of their parties
 * rolled, with dice that fill up toward the next one. The back (the flip button turns the card over) is their Santa
 * record: party counts and a passport stamp for the day they joined and for each of their latest parties.
 */
export const NorthPoleId = () => {
  const { profile } = useCurrentUser();
  const [flipped, setFlipped] = React.useState(false);
  const frontFlip = React.useRef<HTMLButtonElement>(null);
  const backFlip = React.useRef<HTMLButtonElement>(null);
  // Once turned over, the card stays ready to show its back without loading it again.
  const [seenBack, setSeenBack] = React.useState(false);

  const flip = React.useCallback(
    () => {
      setFlipped(was => !was);
      setSeenBack(true);
    },
    [],
  );

  // Focus follows the card: the face now showing gets it, on its own flip button.
  const firstRender = React.useRef(true);
  React.useEffect(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      (flipped ? backFlip : frontFlip).current?.focus({ preventScroll: true });
    },
    [flipped],
  );

  if (!profile) {
    return null;
  }
  const joined = profile.joinedAt ? new Date(profile.joinedAt) : null;
  const joinedDate = joined && !isNaN(joined.getTime()) ? joined : null;
  const number = hash(profile.id).toString(16).toUpperCase().padStart(8, "0").slice(0, 4);

  return (
    <section className="np-id" aria-label="Your Secret Santa ID">
      {/* The stamps' worn ink: specks of paper showing through. */}
      <svg className="np-defs" aria-hidden="true" focusable="false">
        {/* The rank chevrons' gold thread. */}
        <pattern id="np-thread" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="3" fill="#e6b84f" />
          <rect width="1" height="3" fill="#b8892b" />
        </pattern>
        <filter id="np-ink">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 2.05" result="specks" />
          <feComposite in="SourceGraphic" in2="specks" operator="in" />
        </filter>
      </svg>
      <div className={cn("np-flipper", flipped && "is-flipped")}>
        <div className="np-face np-front" inert={flipped}>
          <Front number={number} joined={joinedDate} counts={profile.parties} onFlip={flip} flipRef={frontFlip} />
        </div>
        <div className="np-face np-back" inert={!flipped}>
          {seenBack && <Back joined={joinedDate} counts={profile.parties} onFlip={flip} flipRef={backFlip} />}
        </div>
      </div>
    </section>
  );
};

type FaceProps = {
  joined: Date | null;
  counts?: PartyCounts;
  onFlip: () => void;
  flipRef: React.Ref<HTMLButtonElement>;
};

const FlipButton = ({ onFlip, flipRef, label }: { onFlip: () => void; flipRef: React.Ref<HTMLButtonElement>; label: string }) => (
  <button ref={flipRef} type="button" className="np-flip" onClick={onFlip} aria-label={label} title={label}>
    <RotateCw size={14} aria-hidden="true" />
  </button>
);

const Front = ({ number, joined, counts, onFlip, flipRef }: FaceProps & { number: string }) => {
  const rolled = counts?.rolled;
  const rank = rolled === undefined ? null : rankFor(rolled).rank;
  const level = rank ? RANKS.indexOf(rank) : -1;
  const days = joined && daysSince(joined);

  return (
    <>
      <header className="np-strip">
        <span><span className="np-strip-long">North Pole · </span>Secret Santa ID</span>
        <span className="np-strip-end">No. NP-{number}<FlipButton onFlip={onFlip} flipRef={flipRef} label="Turn the card over" /></span>
      </header>

      <div className="np-main">
        <div className="np-photo">
          <Silhouette />
          {rank && <RankChevrons level={level} name={rank.name} />}
        </div>
        <NameField />
        <EmailField />
        {joined && (
          <dl className="np-facts">
            <div>
              <dt className="np-label">Undercover</dt>
              <dd className="np-value">{days} {days === 1 ? "day" : "days"}</dd>
            </div>
            <div>
              <dt className="np-label">Issued</dt>
              <dd className="np-value">{cardDate(joined)}</dd>
            </div>
            <div className="np-valid">
              <dt className="np-label">Valid to</dt>
              <dd className="np-value">25 Dec</dd>
            </div>
          </dl>
        )}
      </div>

      {rolled !== undefined && <RankTrack rolled={rolled} />}

      <p className="np-mrz" aria-hidden="true">
        {mrzLine("ID", "NPL", "", "ANONYMOUS", "", "SANTA")}
        <br />
        {mrzLine(`NP${number}`, String(joined?.getFullYear() ?? ""), rank?.name ?? "", "", String(rolled ?? ""))}
      </p>
    </>
  );
};

/** The photo: a head and shoulders, a black bar over the eyes. */
const Silhouette = () => (
  <svg viewBox="0 0 100 122" aria-hidden="true" focusable="false">
    <circle cx="50" cy="46" r="23" fill="#c9b77a" />
    <path d="M8 122c3-30 20-42 42-42s39 12 42 42z" fill="#c9b77a" />
    <rect x="23" y="38" width="54" height="13" fill="#18181b" />
  </svg>
);

/** What each rank wears, by rank: a star (the first and the last), chevrons, and a rocker under them. */
const INSIGNIA = [
  { star: "big", chevrons: 0, rocker: false },
  { star: null, chevrons: 1, rocker: false },
  { star: null, chevrons: 2, rocker: false },
  { star: null, chevrons: 3, rocker: false },
  { star: null, chevrons: 3, rocker: true },
  { star: "small", chevrons: 3, rocker: true },
] as const;

/** A five-pointed star centred on (x, y), its points `r` from the centre. */
const star = (x: number, y: number, r: number) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + i * Math.PI / 5;
  const d = i % 2 ? r * 0.42 : r;
  return `${(x + d * Math.cos(a)).toFixed(1)},${(y + d * Math.sin(a)).toFixed(1)}`;
}).join(" ");

/** A chevron's band, its top at `y`: 7 thick, its point 16 below its ends. */
const chevron = (y: number) => `M4 ${y}L32 ${y + 16}L60 ${y}v7L32 ${y + 23}L4 ${y + 7}z`;
/** A rocker's band, its ends at `y`: an arc under the chevrons, 7 thick. */
const rocker = (y: number) => `M4 ${y}Q32 ${y + 18} 60 ${y}v7Q32 ${y + 25} 4 ${y + 7}z`;

/**
 * The rank as sleeve chevrons sewn on the photo's corner: gold-thread bands with a pine edge, stacked down from an
 * optional star, a rocker under them for the top ranks. Rookie elf wears just a star.
 */
const RankChevrons = ({ level, name }: { level: number; name: string }) => {
  const insignia = INSIGNIA[level];
  const shapes: React.ReactNode[] = [];
  let y = 2;
  if (insignia.star === "big") {
    shapes.push(<polygon key="star" points={star(32, 17, 15)} />);
    y = 34;
  }
  if (insignia.star === "small") {
    shapes.push(<polygon key="star" points={star(32, 10, 8.5)} />);
    y = 22;
  }
  for (let i = 0; i < insignia.chevrons; i++) {
    shapes.push(<path key={`c${i}`} d={chevron(y + i * 11)} />);
  }
  if (insignia.chevrons) {
    y += (insignia.chevrons - 1) * 11 + 23 + 3;
  }
  if (insignia.rocker) {
    shapes.push(<path key="rocker" d={rocker(y)} />);
    y += 25;
  }

  return (
    <span className="np-chevrons" role="img" aria-label={`Rank: ${name}`}>
      <svg viewBox={`0 0 64 ${y + 2}`} aria-hidden="true" focusable="false">{shapes}</svg>
    </span>
  );
};

/** A label over its value, or over the form that edits it: one of the card's fields. */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="np-field">
    <div className="np-label">{label}</div>
    {children}
  </div>
);

/**
 * Whether a field is being edited. When editing ends (saved, cancelled, or Esc), focus goes back to the field's
 * pencil, so the next Esc closes the dialog.
 */
const useEditing = () => {
  const [editing, setEditing] = React.useState(false);
  const pencil = React.useRef<HTMLButtonElement>(null);
  const wasEditing = React.useRef(false);

  React.useEffect(
    () => {
      if (wasEditing.current && !editing) {
        pencil.current?.focus({ preventScroll: true });
      }
      wasEditing.current = editing;
    },
    [editing],
  );

  return { editing, setEditing, pencil };
};

type InlineFieldProps = {
  name: string;
  action: React.ReactNode;
  hint: React.ReactNode;
  onCancel: () => void;
  children: React.ReactNode;
};

/**
 * An input with its buttons on the same line, as tall as the value it replaces, so nothing on the card moves when
 * editing starts. Its hint, and its error after a submit, float under it in a note over the card. Esc cancels the
 * edit and goes no further: the dialog stays open until the next one.
 */
const InlineField = ({ name, action, hint, onCancel, children }: InlineFieldProps) => {
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  const id = React.useId();
  const error: string | undefined = getFieldState(name, formState).error?.message;

  return (
    <FormFieldContext.Provider value={{ name, id, messageId: `${id}-note`, invalid: !!error }}>
      <div
        className="np-editing"
        onKeyDown={event => {
          if (event.key === "Escape" && !event.nativeEvent.isComposing) {
            // Stopped here, it never reaches the dialog's own Esc handlers (on its popup and on the document).
            event.preventDefault();
            event.stopPropagation();
            onCancel();
          }
        }}
      >
        <div className={cn("np-control np-box", error && "is-invalid")}>
          <div className="np-input">{children}</div>
          {action}
        </div>
        {/* A callout pointing up at the field: the error first, in a red strip, then the hint. */}
        <div id={`${id}-note`} className="np-note">
          {error && <p className="np-error" role="alert"><AlertCircle size={14} aria-hidden="true" />{error}</p>}
          <p className="np-hint"><Info size={14} aria-hidden="true" />{hint}</p>
        </div>
      </div>
    </FormFieldContext.Provider>
  );
};

/** The card's input: borderless inside its framed box (`np-box`), in the card's type. */
const FIELD = "h-[30px] rounded-none border-0 bg-transparent px-1.5 font-mono text-[0.9375em] shadow-none "
  + "placeholder:font-mono placeholder:text-[#b3a77f] focus-visible:ring-0 focus-visible:ring-offset-0 aria-invalid:border-0";

/** Save and Send link: a small red square with an icon, inside the field's frame, its name in its label. */
const CardSubmit = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
  <Submit
    size="sm"
    className="size-[30px] min-h-0 shrink-0 rounded-md bg-[#c62a30] px-0 text-white hover:bg-[#a8242a] focus-visible:ring-2 focus-visible:ring-[#c62a30] focus-visible:ring-offset-1"
    aria-label={label}
    title={label}
  >
    {icon}
  </Submit>
);

const CancelButton = ({ onClick }: { onClick: () => void }) => (
  <Button type="button" variant="ghost" size="sm" className="size-[30px] min-h-0 shrink-0 rounded-md px-0 text-[#8a7f5c] hover:bg-[#f6edcf] hover:text-zinc-900" aria-label="Cancel" title="Cancel" onClick={onClick}>
    <X size={16} aria-hidden="true" />
  </Button>
);

/** The pencil after a value, the same for every field on the card. */
const EditButton = ({ label, onClick, ref }: { label: string; onClick: () => void; ref: React.Ref<HTMLButtonElement> }) => (
  <Button ref={ref} type="button" variant="ghost-destructive" size="sm" className="np-edit size-8 min-h-0 px-0" aria-label={label} title={label} onClick={onClick}>
    <Edit2 size={15} aria-hidden="true" />
  </Button>
);

/** The name: the pencil turns it into a field, right on the card. */
const NameField = () => {
  const { profile, updateProfile } = useCurrentUser();
  const { updateName } = useAppClient();
  const { success } = useNotifications();
  const { editing, setEditing, pencil } = useEditing();
  const name = profile?.name ?? "";

  const onSubmit = React.useCallback(
    async ({ name }: UpdateNameInput) => {
      const user = await updateName({ name: name.trim() });
      if (user) {
        updateProfile(user);
        setEditing(false);
        success("Got it! The elves wrote your new name down.");
      }
    },
    [
      updateName,
      updateProfile,
      success,
      setEditing,
    ],
  );

  return (
    <div className="np-name">
      <Field label="Name on the nice list">
        {editing
          ? (
            <Form defaultValues={{ name }} mode="onSubmit" schema={nameSchema} onSubmit={onSubmit}>
              <InlineField
                name="name"
                action={<><CardSubmit label="Save" icon={<Check size={16} aria-hidden="true" />} /><CancelButton onClick={() => setEditing(false)} /></>}
                onCancel={() => setEditing(false)}
                hint="We'll suggest it when you join a new party. Parties you've already joined keep the name you joined with."
              >
                <Input className={FIELD} placeholder="How should friends call you?" autofocus maxLength={MAX_PERSON_NAME_LENGTH} />
              </InlineField>
            </Form>
          )
          : (
            <div className="np-control">
              <span className="np-value np-truncate" title={name}>{name || "No name yet"}</span>
              <EditButton ref={pencil} label="Edit your name" onClick={() => setEditing(true)} />
            </div>
          )}
      </Field>
    </div>
  );
};

/** The email, masked; changing it sends a confirmation link to the new address (handled by ConfirmEmailChange). */
const EmailField = () => {
  const { profile } = useCurrentUser();
  const { requestEmailChange } = useAppClient();
  const { success } = useNotifications();
  const email = profile?.email ?? "";
  const { editing, setEditing, pencil } = useEditing();
  const [sentTo, setSentTo] = React.useState<string>();
  // One id per opened form: sending the same address again from it doesn't email twice; a new address is a new request.
  const requestId = React.useRef("");
  const schema = React.useMemo(() => emailSchema(email), [email]);

  const startEditing = React.useCallback(
    () => {
      requestId.current = crypto.randomUUID();
      setEditing(true);
    },
    [setEditing],
  );

  const onSubmit = React.useCallback(
    async (input: RequestEmailChangeInput) => {
      const newEmail = input.email.trim();
      if (await requestEmailChange({ email: newEmail, requestId: requestId.current })) {
        setSentTo(newEmail);
        setEditing(false);
        success(`Check ${newEmail} for a confirmation link. Your email changes once you click it.`);
      }
    },
    [
      requestEmailChange,
      success,
      setEditing,
    ],
  );

  return (
    <div className="np-email">
      <Field label="Elf mail">
        {editing
          ? (
            <Form defaultValues={{ email: "" }} mode="onSubmit" schema={schema} onSubmit={onSubmit}>
              <InlineField
                name="email"
                action={<><CardSubmit label="Send the link" icon={<Send size={15} aria-hidden="true" />} /><CancelButton onClick={() => setEditing(false)} /></>}
                onCancel={() => setEditing(false)}
                hint={<>We'll email a confirmation link to the new address. Until you click it, you stay {maskEmail(email)}.</>}
              >
                <Input type="email" className={FIELD} placeholder="New email address" autofocus maxLength={MAX_EMAIL_LENGTH} />
              </InlineField>
            </Form>
          )
          : (
            <div className="np-control">
              <span className="np-value np-truncate" title={maskEmail(email)}>{maskEmail(email)}</span>
              {/* Once a link is out, a tag says so on the same line (the toast said where), so nothing moves. */}
              {sentTo && <span className="np-sent" title={`Check ${sentTo} for a confirmation link. Your email changes once you click it.`}>Link sent</span>}
              <EditButton ref={pencil} label="Change your email" onClick={startEditing} />
            </div>
          )}
      </Field>
    </div>
  );
};

/** Where on the rank's die each pip goes, by face. */
const PIPS: Record<number, [number, number][]> = {
  1: [[12, 12]],
  2: [[7.5, 7.5], [16.5, 16.5]],
  3: [[7, 7], [12, 12], [17, 17]],
  4: [[7.5, 7.5], [16.5, 7.5], [7.5, 16.5], [16.5, 16.5]],
  5: [[7, 7], [17, 7], [12, 12], [7, 17], [17, 17]],
};

const Die = ({ face, rolled }: { face: number; rolled: boolean }) => (
  <svg viewBox="0 0 24 24" className={cn("np-die", rolled && "is-rolled")} aria-hidden="true" focusable="false">
    <rect x="1.5" y="1.5" width="21" height="21" rx="5" />
    {rolled && PIPS[face].map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r="2.1" />)}
  </svg>
);

/**
 * The rank and the way to the next one: a die per rolled party it takes (one more each rank), rolled ones showing
 * their pips.
 */
const RankTrack = ({ rolled }: { rolled: number }) => {
  const { rank, next } = rankFor(rolled);
  const step = next ? next.least - rank.least : 0;
  const done = rolled - rank.least;

  return (
    <div className="np-rank">
      <div className="min-w-0">
        <div className="np-label">Rank · {rolled} rolled {rolled === 1 ? "party" : "parties"}</div>
        <div className="np-value">
          {rank.name}
          {next && <span className="np-next"> → {next.name}</span>}
        </div>
      </div>
      {next
        ? (
          <div className="np-track">
            <div className="np-dice" role="img" aria-label={`${done} of ${step} rolled parties to ${next.name}`}>
              {Array.from({ length: step }, (_, i) => <Die key={i} face={i + 1} rolled={i < done} />)}
            </div>
            <div className="np-label">{step - done} more to go</div>
          </div>
        )
        : <div className="np-label">Top of the list</div>}
    </div>
  );
};

/** How many of the latest parties the back stamps: fewer on a phone, where the card is narrow. */
const STAMPS_WIDE = 6;
const STAMPS_NARROW = 4;

/**
 * Where the stamps land, as fractions of the room left beside and under them (so they never stick out), the day
 * joined first: they overlap like a well-travelled passport.
 */
const SLOTS_WIDE: [number, number][] = [[0, 0.12], [0.28, 0], [0.53, 0.42], [0.86, 0.04], [0.1, 1], [0.37, 0.92], [0.8, 0.96]];
const SLOTS_NARROW: [number, number][] = [[0, 0], [1, 0.06], [0.32, 0.44], [0, 1], [0.96, 0.86]];

const Back = ({ joined, counts, onFlip, flipRef }: FaceProps) => {
  const { getPartyHistory } = useAppClient();
  const tabletUp = useTabletUp();
  const [parties, setParties] = React.useState<Party[] | null>(null);

  React.useEffect(
    () => {
      let current = true;
      // A few spare, so deleted ones (which get no stamp) don't leave the page short.
      getPartyHistory(STAMPS_WIDE + 2).then(page => {
        if (current) {
          setParties((page?.items ?? []).filter(party => !party.deletedAt));
        }
      });
      return () => {
        current = false;
      };
    },
    [
      getPartyHistory,
    ],
  );

  const shown = (parties ?? []).slice(0, tabletUp ? STAMPS_WIDE : STAMPS_NARROW);
  const slots = tabletUp ? SLOTS_WIDE : SLOTS_NARROW;
  const more = counts ? counts.joined - shown.length : 0;
  const tally = counts && `${counts.joined} ${counts.joined === 1 ? "party" : "parties"} · ${counts.rolled} rolled · ${counts.hosted} hosted`;

  return (
    <>
      <header className="np-strip">
        <span>Santa record</span>
        <span className="np-strip-end">
          {tally && <span className="np-counts">{tally}</span>}
          <FlipButton onFlip={onFlip} flipRef={flipRef} label="Turn the card back" />
        </span>
      </header>
      {/* On a phone the strip has no room for the counts: they get a line of their own. */}
      {tally && <p className="np-counts-row" aria-hidden="true">{tally}</p>}

      <ul className="np-stamps" aria-label="Passport stamps">
        {joined && (
          <Stamp
            slot={slots[0]}
            seed="arrived"
            shape="ring"
            ink={INKS[0]}
            label="Arrived"
            title="North Pole"
            date={<>{String(joined.getDate()).padStart(2, "0")} {month(joined)}<br />{joined.getFullYear()}</>}
            icon={<Snowflake />}
          />
        )}
        {shown.map((party, i) => <PartyStamp key={party.code} party={party} slot={slots[i + 1]} />)}
        {parties?.length === 0 && <li className="np-stamps-empty">Join a party to collect your first stamp.</li>}
      </ul>
      {more > 0 && <p className="np-more">+{more} more {more === 1 ? "stamp" : "stamps"} in your history</p>}

      <footer className="np-back-foot">
        <span>If found, return to the North Pole.<br />Do not open before 25 Dec.</span>
        <span className="np-barcode" aria-hidden="true" />
      </footer>
    </>
  );
};

type Shape = "ring" | "frame" | "oval" | "hex" | "ticket" | "pill";
const SHAPES: Shape[] = ["frame", "oval", "hex", "ticket", "pill", "ring"];
/** Each shape's size, in ems of the stamp's own type. */
const SIZES: Record<Shape, [number, number]> = {
  ring: [10.5, 10.5],
  frame: [13.5, 7.6],
  oval: [12, 7.8],
  hex: [9.8, 10.4],
  ticket: [14, 6.6],
  pill: [13, 6.8],
};
/** Stamp inks: red, pine, plum, navy, bronze, berry. */
const INKS = ["#c62a30", "#3b6d11", "#534ab7", "#185fa5", "#854f0b", "#993556"];

/** A party's stamp: its shape, ink and tilt come from its code, so it always looks the same. */
const PartyStamp = ({ party, slot }: { party: Party; slot: [number, number] }) => {
  const h = hash(party.code);
  const when = party.rolledAt ?? party.createdAt;
  const date = when ? new Date(when) : null;
  const [label, icon] = party.isHost
    ? ["Hosted", <Star key="host" />]
    : party.isClosed ? ["Rolled", <Gift key="rolled" />] : ["Open", <Clock key="open" />];

  return (
    <Stamp
      slot={slot}
      seed={party.code}
      shape={SHAPES[h % SHAPES.length]}
      ink={INKS[(h >>> 4) % INKS.length]}
      label={label}
      title={party.name}
      date={date && !isNaN(date.getTime()) ? `${month(date)} ${date.getFullYear()}` : ""}
      icon={icon}
    />
  );
};

type StampProps = {
  slot: [number, number];
  seed: string;
  shape: Shape;
  ink: string;
  label: string;
  title: string;
  date: React.ReactNode;
  icon: React.ReactNode;
};

/** One stamp: its outline drawn in SVG, its words over it; a circle's words run round its rim. */
const Stamp = ({ slot: [x, y], seed, shape, ink, label, title, date, icon }: StampProps) => {
  const h = hash(seed);
  const [w, hgt] = SIZES[shape];
  const tilt = (h % 25) - 12;
  const style = {
    "--x": x,
    "--y": y,
    "--w": `${w}em`,
    "--h": `${hgt}em`,
    "--tilt": `${tilt}deg`,
    "--ink": ink,
  } as React.CSSProperties;

  return (
    <li className={`np-stamp is-${shape}`} style={style}>
      <StampOutline shape={shape} seed={seed} label={label} title={title} />
      <span className="np-stamp-text">
        <span className="np-stamp-icon">{icon}</span>
        {shape !== "ring" && <span className="np-stamp-label">{label}</span>}
        {shape !== "ring" && <span className="np-stamp-title">{title}</span>}
        <span className="np-stamp-date">{date}</span>
      </span>
    </li>
  );
};

const StampOutline = ({ shape, seed, label, title }: { shape: Shape; seed: string; label: string; title: string }) => {
  const id = `np-rim-${hash(seed).toString(36)}`;
  switch (shape) {
    case "ring": {
      // The rim's words, said twice when short, spread to fill the circle.
      const words = `${label} · ${title.length > 14 ? `${title.slice(0, 13)}…` : title} · `.toUpperCase();
      return (
        <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
          <defs><path id={id} d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" /></defs>
          <circle cx="60" cy="60" r="57" strokeWidth="3" />
          <circle cx="60" cy="60" r="52.5" strokeWidth="1" />
          <circle cx="60" cy="60" r="34" strokeWidth="1.5" strokeDasharray="3 2" />
          <text className="np-rim"><textPath href={`#${id}`} textLength="276" lengthAdjust="spacing">{words.length <= 24 ? words + words : words}</textPath></text>
        </svg>
      );
    }
    case "frame":
      return (
        <svg viewBox="0 0 150 84" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect x="2" y="2" width="146" height="80" rx="4" strokeWidth="3" />
          <rect x="8" y="8" width="134" height="68" rx="2" strokeWidth="1" />
        </svg>
      );
    case "oval":
      return (
        <svg viewBox="0 0 120 78" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <ellipse cx="60" cy="39" rx="57" ry="36" strokeWidth="3" />
          <ellipse cx="60" cy="39" rx="50" ry="29" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case "hex":
      return (
        <svg viewBox="0 0 98 104" aria-hidden="true" focusable="false">
          <polygon points="49,3 94,27 94,77 49,101 4,77 4,27" strokeWidth="3" />
          <polygon points="49,11 87,31 87,73 49,93 11,73 11,31" strokeWidth="1" />
        </svg>
      );
    case "ticket":
      return (
        <svg viewBox="0 0 140 66" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M13 3h114l10 30-10 30H13L3 33z" strokeWidth="3" />
        </svg>
      );
    case "pill":
      return (
        <svg viewBox="0 0 130 68" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <rect x="2" y="2" width="126" height="64" rx="32" strokeWidth="3" />
          <rect x="8" y="8" width="114" height="52" rx="26" strokeWidth="1" strokeDasharray="4 2" />
        </svg>
      );
  }
};

/** The arrival stamp's snowflake: three crossed strokes. */
const Snowflake = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="np-snowflake">
    <path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" />
  </svg>
);
