import React from "react";
import { Footer as BulmaFooter } from "react-bulma-components";
import { GitHub } from 'react-feather';
import { Link } from "react-router-dom";

import { useCurrentUser } from "src/components/hooks";

type Props = {
  children?: React.ReactNode;
  noUser?: boolean;
  noHome?: boolean;
  profileAsLink?: boolean;
};

type MenuItem = {
  key: string;
  label: React.ReactNode;
  url: string;
  target?: string;
  title?: string;
  onClick?: () => void;
  asLink?: boolean;
};

export const Footer = ({ children, noUser, noHome, profileAsLink }: Props) => {
  const { user, signOut } = useCurrentUser();

  const onSignOutClick = React.useCallback(
    (e: MouseEvent) => {
      signOut();
      e.preventDefault();
      return false;
    },
    [
      signOut,
    ],
  );

  const items = React.useMemo(
    () => [
      { key: "test-party", label: "Test Party", url: "/p/XCERTS", asLink: profileAsLink },
      { key: "test-enter", label: "Test Enter", url: "/enter/eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsInQiOiJFbnRlclJlcXVlc3QiLCJfIjoiZjU1NDA4MTQyYmQ3ZDlkMiJ9.eyJlbWFpbCI6InBhc2hrYS5yZXpuaWtvdkBnbWFpbC5jb20iLCJleHAiOjE3MDM2MjQ3NDksImlzcyI6ImFwaS5nbm9taWsubWUiLCJpYXQiOjE3MDM2MjQ0NDl9.jotXwULQbG0pbMZsTpsMwiz_C3I61Wpqo6ZTBwvhbRKlUSvolsaTce01pznXMvUnY9qGdYp-43AqfvQrKQG7iw2JWcl6V-KrW6ViU9NfBfNAtB_iHzuCwKz-qS01tarUC37UfeSHi0BzEO4WWUs0CfSEZS5NHj5UIdiccwIAeAnJ02mb9i8hGLBcrzJZKVEMm6X9p7ha5iC-JEpvGEldQMSkl9sOCOYMgibVcNQupLJfxMBttwO6roBpDf9o1SromkGyMhomHwbpJ_ub99ASNCIitfVXpJoYUOyvp5hTk_wtwwGYgcjPPN48RKClpynXj8NF8ZkJZus2K8QpEucNug", asLink: profileAsLink },
      !noHome ? { key: "home", label: "Home", url: "/" } : null,
      (!noUser && user) ? { key: "profile", label: "My Profile", url: "/profile/", asLink: profileAsLink } : null,
      (!noUser && user) ? { key: "sign-out", label: "Sign Out", url: "/", onClick: onSignOutClick } : null,
      { key: "hot-it-works", label: "How this works?", url: "/how-it-works/" },
      { key: "privacy", label: "Privacy Policy", url: "/privacy/" },
      { key: "terms", label: "Terms and Conditions", url: "/terms/" },
      { key: "status", label: "Status", url: "https://status.uglyunicorn.ca/", target: "_blank" },
      { key: "github", label: <GitHub size={18} />, url: "https://github.com/uglyunicorn-eh/santa-barbara", target: "_blank", title: "GitHub" },
    ].filter(Boolean) as MenuItem[],
    [
      user,
      signOut,
    ],
  );

  return (
    <BulmaFooter className="page-footer">
      <div className="footer-menu">
        {items.map(({ key, url, label, asLink, ...rest }, index) => (
          <React.Fragment key={key}>
            {index ? <span> | </span> : null}
            {asLink
              ? <Link to={url}>{label}</Link>
              : <a href={url} {...rest}>{label}</a>
            }
          </React.Fragment>
        ))}
      </div>
      <div className="footer-copy is-size-7">
        Made with ❤ in Canada by <a href="https://uglyunicorn.ca" target="_blank">Ugly Unicorn</a>
      </div>
      {children && <div className="is-size-7">{children}</div>}
    </BulmaFooter >
  );
};
