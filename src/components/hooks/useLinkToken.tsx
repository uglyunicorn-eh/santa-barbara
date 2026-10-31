import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/** What an emailed link's token is moved into: the tab's history state, with the kind of link when a page takes two. */
type LinkState = { linkToken?: string; linkKind?: string };

/**
 * Moves an emailed link's token into this tab's history state at `path`, marked with `kind`. Returns the token
 * (`undefined` while it's being moved, `null` when there is none) and the kind it was moved with.
 */
function useMovedLink(path: string, kind?: string): { token: string | null | undefined; kind?: string } {
  const { token: pathToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fromUrl = location.hash.slice(1) || pathToken;
  const state = location.state as LinkState | null;

  React.useEffect(
    () => {
      if (fromUrl) {
        navigate(path, { replace: true, state: { linkToken: fromUrl, ...(kind ? { linkKind: kind } : {}) } });
      }
    },
    [fromUrl, path, kind, navigate],
  );

  if (fromUrl) {
    return { token: undefined };
  }
  return { token: state?.linkToken || null, kind: state?.linkKind };
}

/**
 * An emailed link's token. New links carry it after "#", which never reaches a server, so it stays out of logs,
 * analytics and the Referer header; older links have it in the path (`:token`). Either way it's moved into this tab's
 * history state at `path`, so the address bar doesn't show it and a reload in this tab still finds it.
 *
 * Returns the token, `undefined` while it's being moved (one render), or `null` when the link has none.
 */
export const useLinkToken = (path: string): string | null | undefined => useMovedLink(path).token;

/** A member's sign-in link is the party's address with "sign-in" after it. */
const SIGN_IN = /\/sign-in\/?$/;

/**
 * The party page's emailed links, each moved off the address bar like useLinkToken's:
 * - an invite (`/p/<code>/#<token>`) lets someone signed out join with just a name;
 * - a member's sign-in link (`/p/<code>/sign-in#<token>`, in the reminder and "dice are rolled" emails) signs a
 *   member in, and lands on the party's own address.
 * Each is `undefined` while a token is being moved, and `null` when there is none of that kind.
 */
export const usePartyLink = (): { inviteToken: string | null | undefined; memberToken: string | null | undefined } => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const memberLink = SIGN_IN.test(pathname);
  const partyPath = pathname.replace(SIGN_IN, "/");
  const { token, kind } = useMovedLink(partyPath, memberLink ? "member" : undefined);

  // "sign-in" without a token (copied without its "#" part, say) is just the party.
  React.useEffect(
    () => {
      if (memberLink && !hash) {
        navigate(partyPath, { replace: true });
      }
    },
    [memberLink, hash, partyPath, navigate],
  );

  if (token === undefined) {
    return { inviteToken: undefined, memberToken: undefined };
  }
  return kind === "member" ? { inviteToken: null, memberToken: token } : { inviteToken: token, memberToken: null };
};
