import React from "react";
import { ChevronRight, Gift, Star } from "react-feather";
import { Link } from "react-router-dom";

import { useAppClient, useSignals, useUnrevealed } from "@/components/hooks";
import { PARTIES_CHANGED } from "@/components/hooks/useAppClient";
import { tiltHandlers } from "@/lib/tilt";
import type { Party } from "@/types";

/** How many of the newest parties to look through: enough to find a few that aren't deleted. */
const LOOK_AT = 10;

/** How many tickets the pile shows. */
const PILE = 3;

/** When something last happened in a party: the dice rolled, or else it started (or, as a guest, roughly when joined). */
const lastActive = (party: Party) => Math.max(Date.parse(party.rolledAt ?? "") || 0, Date.parse(party.createdAt ?? "") || 0);

/**
 * The parties the user was last busy with, hosting or as a guest, latest first: up to three, by when they started or
 * rolled, deleted ones left out. `undefined` while loading, empty when there are none. Loads again when their parties
 * change.
 */
export const useLatestParties = () => {
  const { getPartyHistory } = useAppClient();
  const { subscribe } = useSignals();
  const [parties, setParties] = React.useState<Party[]>();
  const [reloads, setReloads] = React.useState(0);

  React.useEffect(
    () => {
      let current = true;
      getPartyHistory(LOOK_AT).then(page => {
        if (current && page) {
          const live = page.items.filter(item => !item.deletedAt);
          setParties(live.sort((a, b) => lastActive(b) - lastActive(a)).slice(0, PILE));
        }
      });
      return () => {
        current = false;
      };
    },
    [
      getPartyHistory,
      reloads,
    ],
  );

  React.useEffect(
    () => subscribe(PARTIES_CHANGED, () => setReloads(n => n + 1)),
    [
      subscribe,
    ],
  );

  return parties;
};

/** A ticket under the mouse tilts like the landing's step cards, a little less (it's smaller and closer to the eye). */
const ticketTilt = tiltHandlers(6);

/**
 * Each time the pile opens, its column comes out a little different: every ticket gets a new small lean (--lean, up to
 * 1.5° either way) and sideways nudge (--nudge, up to 6px), which welcome.css uses while it's open.
 */
const shuffle = (pile: HTMLElement) => {
  for (const wrap of pile.querySelectorAll<HTMLElement>(".welcome-ticket-wrap")) {
    wrap.style.setProperty("--lean", `${(Math.random() * 3 - 1.5).toFixed(2)}deg`);
    wrap.style.setProperty("--nudge", `${(Math.random() * 12 - 6).toFixed(1)}px`);
  }
};

/** The pile opens on the pointer coming in, or keyboard focus coming in from outside it (not moving between tickets). */
const shuffleOnEnter = (event: React.PointerEvent<HTMLElement>) => shuffle(event.currentTarget);
const shuffleOnFocus = (event: React.FocusEvent<HTMLElement>) => {
  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
    shuffle(event.currentTarget);
  }
};

const dateFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

const formatDate = (iso?: string | null) => {
  const date = iso ? new Date(iso) : null;
  return date && !isNaN(date.getTime()) ? dateFormat.format(date) : null;
};

/**
 * One ticket stub, like the Party'o'meter's raffle tickets: cream paper, the party on the main part (its code at the
 * top right), and a stub past a perforation (notches at both ends) with the code again, in red. The whole ticket opens
 * the party (its link stretches over it). `torn` (the user has heard whom they give a gift to): the stub is torn off
 * along the perforation, leaving a ragged edge, the red line and the notches' halves. Under the mouse it tilts toward
 * the pointer and comes up a little, like the landing's step cards (without their jiggle: it only moves when the mouse
 * does). `children` go under a perforated rule (the phone's links).
 */
const Ticket = ({ party, label, torn, children }: { party: Party; label: string; torn: boolean; children?: React.ReactNode }) => {
  const { code, name, isHost, isClosed, createdAt, rolledAt } = party;
  const rolled = formatDate(rolledAt);
  const started = formatDate(createdAt);
  const status = isClosed
    ? (rolled ? `Dice rolled ${rolled}` : "Dice rolled")
    : (started ? `Open since ${started}` : "Open");

  return (
    <div className={torn ? "welcome-ticket is-torn" : "welcome-ticket"} {...ticketTilt}>
      <div className="welcome-ticket-main">
        <div className="welcome-latest-title" aria-hidden="true">
          <span>{label}</span>
          <span className="welcome-latest-number">{code}</span>
        </div>
        <Link to={`/p/${code}/`} className="welcome-latest-party">
          <span className={`welcome-latest-icon ${isHost ? "is-host" : "is-guest"}`} aria-hidden="true">
            {isHost ? <Star size={18} /> : <Gift size={18} />}
          </span>
          <span className="welcome-latest-text">
            <span className="welcome-latest-name">{name}</span>
            <span className="welcome-latest-meta">
              {isHost ? "You host" : "You joined"} &middot; {status}
            </span>
          </span>
        </Link>
        {children}
      </div>
      {!torn && (
        <div className="welcome-ticket-stub" aria-hidden="true">
          <span className="welcome-ticket-code">{code}</span>
          <ChevronRight size={16} className="welcome-latest-chevron" />
        </div>
      )}
    </div>
  );
};

type Props = {
  /** Latest first (useLatestParties); at least one. */
  parties: Party[];
  /** The phone's version: just the latest, with "All my parties · My profile" on it. */
  links?: boolean;
  className?: string;
};

/**
 * The home screen's "Your latest party". With `links` (phones) one ticket with the links on it. Otherwise (desktop
 * corner, tablet) the last three as a little pile, the latest on top, that lines up in a column on hover or keyboard
 * focus so each can be opened, shuffled a little differently each time. The page places it (StartPage).
 */
export const LatestParty = ({ parties, links = false, className }: Props) => {
  // Revealed: rolled, and no longer among the rolled parties the user hasn't heard their name in (kept live). Until
  // that list has loaded, nothing counts as revealed, so no ticket shows torn and then mends.
  const { parties: unrevealed } = useUnrevealed();
  const isRevealed = (party: Party) =>
    party.isClosed && unrevealed !== null && !unrevealed.some(({ code }) => code === party.code);

  if (links) {
    return (
      <section className={`welcome-latest ${className ?? ""}`} aria-label="Your latest party">
        <div className="welcome-ticket-wrap">
          <Ticket party={parties[0]} label="Your latest party" torn={isRevealed(parties[0])}>
            <div className="welcome-latest-foot">
              <Link to="/profile/history/">All my parties</Link>
              <span aria-hidden="true">&middot;</span>
              <Link to="/profile/">My profile</Link>
            </div>
          </Ticket>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`welcome-latest is-pile ${className ?? ""}`}
      style={{ "--n": parties.length } as React.CSSProperties}
      aria-label={parties.length > 1 ? "Your latest parties" : "Your latest party"}
      onPointerEnter={shuffleOnEnter}
      onFocus={shuffleOnFocus}
    >
      {parties.map((party, index) => (
        <div key={party.code} className="welcome-ticket-wrap" style={{ "--i": index } as React.CSSProperties}>
          <Ticket party={party} label={index ? "Before that" : "Your latest party"} torn={isRevealed(party)} />
        </div>
      ))}
    </section>
  );
};
