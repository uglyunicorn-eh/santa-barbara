import React from "react";
import { PageFooter } from "@/components/layout";
import { GitHub, Menu as MenuIcon } from 'react-feather';
import { Link } from "react-router-dom";

import { COMPACT_KEYS, moreTriggerClass } from "@/components/hoc/footerMenu";
import { useCurrentUser, useUnrevealed } from "@/components/hooks";

// The phone footer's ☰ menu brings Base UI's menu and its positioning: loaded on demand, with a look-alike button in
// its place until then.
const MoreMenu = React.lazy(() => import("@/components/hoc/FooterMoreMenu").then(m => ({ default: m.MoreMenu })));

type Props = {
  children?: React.ReactNode;
  noUser?: boolean;
  noHome?: boolean;
  profileAsLink?: boolean;
  /** Where the profile dialog opens (its tabs live under it): "/profile/" on the home screen, under the party on its page. */
  profileBase?: string;
  /** The links kept in the phone footer's line (the rest go under ☰); COMPACT_KEYS by default. */
  compactKeys?: string[];
};

export type MenuItem = {
  key: string;
  label: React.ReactNode;
  /** The label in the ☰ menu, when `label` isn't text (the GitHub icon). */
  menuLabel?: React.ReactNode;
  url: string;
  target?: string;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  asLink?: boolean;
};

export const Footer = ({ children, noUser, noHome, profileAsLink, profileBase = "/profile/", compactKeys = COMPACT_KEYS }: Props) => {
  const { profile } = useCurrentUser();
  // Rolled parties whose name the user hasn't heard yet: a dot on "My Profile", which then opens on the history.
  const { parties: unrevealed } = useUnrevealed();
  const toReveal = unrevealed?.length ?? 0;

  const items = React.useMemo(
    () => [
      // { key: "test-enter", label: "Test Enter", url: "/enter/eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsInQiOiJFbnRlclJlcXVlc3QiLCJfIjoiMzkwMjlhNDg2ZGZjZmVjMSJ9.eyJlbWFpbCI6InBhc2hrYS5yZXpuaWtvdkBnbWFpbC5jb20iLCJleHAiOjE3MDM4MDc2NzUsImlzcyI6ImFwaS5nbm9taWsubWUiLCJpYXQiOjE3MDM4MDczNzV9.SNntscTrICTAYv_oVDTiJNsmc0tzLHQKXuHVVRrhpBzX12Ir8aUWoCQ0oOxRhKRLIJKO5eBMlQCI8J_HSFTiqz3VAUiAEGHdx-tfgkx7W0TufE2LTltm2x0MXsCWTJbEcnCUppoPBL4BPEUFJuF0C9Z7QDFSVjizOEPwnayCjj4XQR6B3NhUdEojtqLq_EoGWfltaohI0l5QKf20_CQkCpX80yBs8V64Icej4pJ_Cuy-KwOYMrP0pm8rV_wlXHfytY4XatZVlsd24z3BSqcwrUsP_F4By7ZPXMalFtcOPWJMhOp-CACw62rfiMOaxYgKYVFUHmx7PvgtHxcWb02OCQ", asLink: profileAsLink },
      !noHome ? { key: "home", label: "Home", url: "/" } : null,
      (!noUser && profile)
        ? {
          key: "profile",
          label: toReveal ? <ProfileWithDot count={toReveal} /> : "My Profile",
          url: toReveal ? `${profileBase}history/` : profileBase,
          asLink: profileAsLink,
        }
        : null,
      { key: "how-it-works", label: "How this works?", url: "/how-it-works/" },
      { key: "privacy", label: "Privacy Policy", url: "/privacy/" },
      { key: "terms", label: "Terms", url: "/terms/" },
      { key: "status", label: "Status", url: "https://status.uglyunicorn.ca/", target: "_blank" },
      { key: "buy-me-coffee", label: "Buy me a coffee", url: "https://www.buymeacoffee.com/uglyunicorn", target: "_blank" },
      { key: "github", label: <GitHub size={18} />, menuLabel: <><GitHub size={18} aria-hidden="true" /> GitHub</>, url: "https://github.com/uglyunicorn-eh/santa-barbara", target: "_blank", title: "GitHub" },
    ].filter(Boolean) as MenuItem[],
    [
      noHome,
      noUser,
      profile,
      profileAsLink,
      profileBase,
      toReveal,
    ],
  );

  // On phones only these two stay in the line; the rest go under a ☰ menu.
  const inline = items.filter(({ key }) => compactKeys.includes(key));
  const more = items.filter(({ key }) => !compactKeys.includes(key));

  return (
    <PageFooter className="page-footer">
      <div className="footer-menu max-tablet:hidden">
        <FooterLinks items={items} />
      </div>
      <div className="footer-menu tablet:hidden">
        <FooterLinks items={inline} />
        <span> | </span>
        <React.Suspense fallback={<MoreMenuPlaceholder />}>
          <MoreMenu items={more} dot={toReveal > 0 && more.some(({ key }) => key === "profile")} />
        </React.Suspense>
      </div>
      <div className="footer-copy text-xs">
        Made with ❤ in Canada by <a href="https://uglyunicorn.ca" target="_blank">Ugly Unicorn</a>
      </div>
      {children && <div className="text-xs">{children}</div>}
    </PageFooter>
  );
};

/** "My Profile" with a red dot: there are rolled parties to see whom you give a gift to. */
const ProfileWithDot = ({ count }: { count: number }) => (
  <span className="relative">
    My Profile
    <span aria-hidden="true" className="absolute -top-0.5 -right-2 size-2 rounded-full bg-red-500" />
    <span className="sr-only">{` (${count} ${count === 1 ? "party" : "parties"} to reveal)`}</span>
  </span>
);

const FooterLinks = ({ items }: { items: MenuItem[] }) => (
  <>
    {items.map(({ key, url, label, menuLabel, asLink, ...rest }, index) => (
      <React.Fragment key={key}>
        {index ? <span> | </span> : null}
        {asLink
          ? <Link to={url}>{label}</Link>
          : <a href={url} {...rest}>{label}</a>
        }
      </React.Fragment>
    ))}
  </>
);

/** The ☰ button as it looks, for the moment before its menu has loaded. */
const MoreMenuPlaceholder = () => (
  <button type="button" className={`${moreTriggerClass} relative`} aria-label="More links" title="More links" disabled>
    <MenuIcon size={18} aria-hidden="true" />
  </button>
);
