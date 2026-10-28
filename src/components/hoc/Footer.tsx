import React from "react";
import { PageFooter } from "@/components/layout";
import { GitHub, Menu as MenuIcon } from 'react-feather';
import { Link } from "react-router-dom";

import { COMPACT_KEYS, moreTriggerClass } from "@/components/hoc/footerMenu";
import { useCurrentUser, useUnrevealed } from "@/components/hooks";
import { useToastsAboveFooter } from "@/components/hoc/NotificationsContainer";

// The phone footer's ☰ menu brings Base UI's menu and its positioning: a look-alike button stands in until someone
// reaches for it (hover, focus or a touch starts the download), and the click opens the real menu.
const loadMoreMenu = () => import("@/components/hoc/FooterMoreMenu");
const MoreMenu = React.lazy(() => loadMoreMenu().then(m => ({ default: m.MoreMenu })));

type Props = {
  children?: React.ReactNode;
  /**
   * Something to show between the links and the credits (the front door's Party'o'meter). On phones it sits there, in
   * line; a page's styles may place it elsewhere on wider screens.
   */
  aside?: React.ReactNode;
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

export const Footer = ({ children, aside, noUser, noHome, profileAsLink, profileBase = "/profile/", compactKeys = COMPACT_KEYS }: Props) => {
  const { profile } = useCurrentUser();
  // Rolled parties whose name the user hasn't heard yet: a dot on "My Profile", which then opens on the history.
  const { parties: unrevealed } = useUnrevealed();
  const toReveal = unrevealed?.length ?? 0;
  // Signed in, the footer sits at the bottom of the screen: toasts go above it rather than over its links.
  useToastsAboveFooter(!!profile);

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
        <DeferredMoreMenu items={more} dot={toReveal > 0 && more.some(({ key }) => key === "profile")} />
      </div>
      {aside}
      <div className="footer-copy text-xs">
        Made with ❤ in Canada by <a href="https://uglyunicorn.ca" target="_blank">Ugly Unicorn</a>
      </div>
      {children && <div className="text-xs">{children}</div>}
    </PageFooter>
  );
};

/** "My Profile" with a red dot: there are rolled parties to see whom you give a gift to. */
const ProfileWithDot = ({ count }: { count: number }) => (
  // The dot after the words, at the top of the line like a footnote mark: clear of the " | " that follows.
  <span className="inline-flex items-start gap-0.5">
    My Profile
    <span aria-hidden="true" className="mt-0.5 size-2 shrink-0 rounded-full bg-red-500" />
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
/** The ☰ button before the menu's code is loaded: it looks the same, and its click opens the real menu. */
const DeferredMoreMenu = ({ items, dot }: { items: MenuItem[]; dot: boolean }) => {
  const [wanted, setWanted] = React.useState(false);
  const prefetch = React.useCallback(() => void loadMoreMenu(), []);

  const button = (
    <button
      type="button"
      className={`${moreTriggerClass} relative`}
      aria-label={dot ? "More links, with parties to reveal" : "More links"}
      title="More links"
      aria-haspopup="menu"
      disabled={wanted}
      onPointerEnter={prefetch}
      onPointerDown={prefetch}
      onFocus={prefetch}
      onClick={() => setWanted(true)}
    >
      <MenuIcon size={18} aria-hidden="true" />
      {dot && <span aria-hidden="true" className="absolute -top-0.5 -right-1 size-2 rounded-full bg-red-500" />}
    </button>
  );

  if (!wanted) {
    return button;
  }
  return (
    <React.Suspense fallback={button}>
      <MoreMenu items={items} dot={dot} defaultOpen />
    </React.Suspense>
  );
};
