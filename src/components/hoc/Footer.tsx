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
      // { key: "test-enter", label: "Test Enter", url: "/enter/eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsInQiOiJFbnRlclJlcXVlc3QiLCJfIjoiMzkwMjlhNDg2ZGZjZmVjMSJ9.eyJlbWFpbCI6InBhc2hrYS5yZXpuaWtvdkBnbWFpbC5jb20iLCJleHAiOjE3MDM4MDc2NzUsImlzcyI6ImFwaS5nbm9taWsubWUiLCJpYXQiOjE3MDM4MDczNzV9.SNntscTrICTAYv_oVDTiJNsmc0tzLHQKXuHVVRrhpBzX12Ir8aUWoCQ0oOxRhKRLIJKO5eBMlQCI8J_HSFTiqz3VAUiAEGHdx-tfgkx7W0TufE2LTltm2x0MXsCWTJbEcnCUppoPBL4BPEUFJuF0C9Z7QDFSVjizOEPwnayCjj4XQR6B3NhUdEojtqLq_EoGWfltaohI0l5QKf20_CQkCpX80yBs8V64Icej4pJ_Cuy-KwOYMrP0pm8rV_wlXHfytY4XatZVlsd24z3BSqcwrUsP_F4By7ZPXMalFtcOPWJMhOp-CACw62rfiMOaxYgKYVFUHmx7PvgtHxcWb02OCQ", asLink: profileAsLink },
      !noHome ? { key: "home", label: "Home", url: "/" } : null,
      (!noUser && profile) ? { key: "profile", label: "My Profile", url: "/profile/history/", asLink: profileAsLink } : null,
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
