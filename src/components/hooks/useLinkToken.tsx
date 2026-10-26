import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/**
 * An emailed link's token. New links carry it after "#", which never reaches a server, so it stays out of logs,
 * analytics and the Referer header; older links have it in the path (`:token`). Either way it's moved into this tab's
 * history state at `path`, so the address bar doesn't show it and a reload in this tab still finds it.
 *
 * Returns the token, `undefined` while it's being moved (one render), or `null` when the link has none.
 */
export const useLinkToken = (path: string): string | null | undefined => {
  const { token: pathToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fromUrl = location.hash.slice(1) || pathToken;
  const fromState = (location.state as { linkToken?: string } | null)?.linkToken;

  React.useEffect(
    () => {
      if (fromUrl) {
        navigate(path, { replace: true, state: { linkToken: fromUrl } });
      }
    },
    [fromUrl, path, navigate],
  );

  if (fromUrl) {
    return undefined;
  }
  return fromState || null;
};
