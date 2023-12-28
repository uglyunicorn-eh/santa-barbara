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
  const { profile, signOut } = useCurrentUser();

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
      // { key: "test-enter", label: "Test Enter", url: "/enter/eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsInQiOiJFbnRlclJlcXVlc3QiLCJfIjoiODljNjVmNjU0YjVmNzBlZCJ9.eyJlbWFpbCI6InBhc2hrYS5yZXpuaWtvdkBnbWFpbC5jb20iLCJleHAiOjE3MDM3NDAxOTQsImlzcyI6ImFwaS5nbm9taWsubWUiLCJpYXQiOjE3MDM3Mzk4OTR9.eNDJYTqvzA5N8aOVVAqO6PVhyNuHQFRSYRLW0i9baLTFXGDlGGFPvDgHx3DWd3JXDqntrbqajR6KCCMT2tLkPNYLXjbEntLrrf619bOCEtnpKIAx5hbF8FT9wrgsz7T80WiMjrAZrD_Vn0Y-8pyztHc2Of5W0h4kdDgj2qpw_-M5SgLSqzVNULyXY2uuRc2ywo0QGINoY4yoLcsqDIWZgu2TT7vFOYQUO9ISfZZ1XOjikc48zAP44B5XxNi2c-eEvO6jffDo6xmoBANfLbHk6j4XwP9nDtbDOxV8cH2FmWCH2wQLszoyg4mtUlzkC144gKXEJ3PUNp4fH9IZWn3nuQ", asLink: profileAsLink },
      // { key: "test-party", label: "Test Party", url: "/p/XCERTS", asLink: profileAsLink },
      !noHome ? { key: "home", label: "Home", url: "/" } : null,
      (!noUser && profile) ? { key: "profile", label: "My Profile", url: "/profile/", asLink: profileAsLink } : null,
      (!noUser && profile) ? { key: "sign-out", label: "Sign Out", url: "/", onClick: onSignOutClick } : null,
      { key: "hot-it-works", label: "How this works?", url: "/how-it-works/" },
      { key: "privacy", label: "Privacy Policy", url: "/privacy/" },
      { key: "terms", label: "Terms and Conditions", url: "/terms/" },
      { key: "status", label: "Status", url: "https://status.uglyunicorn.ca/", target: "_blank" },
      { key: "github", label: <GitHub size={18} />, url: "https://github.com/uglyunicorn-eh/santa-barbara", target: "_blank", title: "GitHub" },
    ].filter(Boolean) as MenuItem[],
    [
      profile,
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
