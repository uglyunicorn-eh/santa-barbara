import React from "react";
import { ChevronRight, Gift, Star } from "react-feather";
import { Link } from "react-router-dom";

import { useAppClient, useSignals } from "@/components/hooks";
import { PARTIES_CHANGED } from "@/components/hooks/useAppClient";
import type { Party } from "@/types";

/** How many of the newest parties to look through: enough to find one that isn't deleted. */
const LOOK_AT = 10;

/** When something last happened in a party: the dice rolled, or else it started (or, as a guest, roughly when joined). */
const lastActive = (party: Party) => Math.max(Date.parse(party.rolledAt ?? "") || 0, Date.parse(party.createdAt ?? "") || 0);

/**
 * The party the user was last busy with, hosting or as a guest: the one most recently started or rolled, deleted ones
 * left out. `undefined` while loading, `null` when there's none. Loads again when their parties change.
 */
export const useLatestParty = () => {
  const { getPartyHistory } = useAppClient();
  const { subscribe } = useSignals();
  const [party, setParty] = React.useState<Party | null>();
  const [reloads, setReloads] = React.useState(0);

  React.useEffect(
    () => {
      let current = true;
      getPartyHistory(LOOK_AT).then(page => {
        if (current && page) {
          const live = page.items.filter(item => !item.deletedAt);
          setParty(live.sort((a, b) => lastActive(b) - lastActive(a))[0] ?? null);
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

  return party;
};

const dateFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

const formatDate = (iso?: string | null) => {
  const date = iso ? new Date(iso) : null;
  return date && !isNaN(date.getTime()) ? dateFormat.format(date) : null;
};

/**
 * The home screen's "Your latest party": a dark glass card with the party, a link to its page, and with `links`, a
 * rule and "All my parties · My profile" under it (in the page's flow on phones and tablets; the desktop corner card
 * goes without, the footer has My Profile). The page places it (StartPage) and only shows it once there is one
 * (useLatestParty).
 */
export const LatestParty = ({ party, links = false, className }: { party: Party; links?: boolean; className?: string }) => {
  const { code, name, isHost, isClosed, createdAt, rolledAt } = party;
  const rolled = formatDate(rolledAt);
  const started = formatDate(createdAt);
  const status = isClosed
    ? (rolled ? `Dice rolled ${rolled}` : "Dice rolled")
    : (started ? `Open since ${started}` : "Open");

  return (
    <section className={`welcome-latest ${className ?? ""}`} aria-label="Your latest party">
      <h2 className="welcome-latest-title" aria-hidden="true">Your latest party</h2>
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
        <ChevronRight size={20} className="welcome-latest-chevron" aria-hidden="true" />
      </Link>
      {links && (
        <div className="welcome-latest-foot">
          <Link to="/profile/history/">All my parties</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/profile/">My profile</Link>
        </div>
      )}
    </section>
  );
};
