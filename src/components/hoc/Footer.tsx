import React from "react";
import { Footer as BulmaFooter } from "src/components/bulma";
import { Menu } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";
import { GitHub } from 'react-feather';
import { Link } from "react-router-dom";

import { COMPACT_KEYS, moreItemClass, morePopupClass, moreTriggerClass } from "src/components/hoc/footerMenu";
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
  /** The label in the "More…" menu, when `label` isn't text (the GitHub icon). */
  menuLabel?: React.ReactNode;
  url: string;
  target?: string;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  asLink?: boolean;
};

export const Footer = ({ children, noUser, noHome, profileAsLink }: Props) => {
  const { profile, signOut } = useCurrentUser();

  const onSignOutClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      signOut();
    },
    [
      signOut,
    ],
  );

  const items = React.useMemo(
    () => [
      // { key: "test-enter", label: "Test Enter", url: "/enter/eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsInQiOiJFbnRlclJlcXVlc3QiLCJfIjoiMzkwMjlhNDg2ZGZjZmVjMSJ9.eyJlbWFpbCI6InBhc2hrYS5yZXpuaWtvdkBnbWFpbC5jb20iLCJleHAiOjE3MDM4MDc2NzUsImlzcyI6ImFwaS5nbm9taWsubWUiLCJpYXQiOjE3MDM4MDczNzV9.SNntscTrICTAYv_oVDTiJNsmc0tzLHQKXuHVVRrhpBzX12Ir8aUWoCQ0oOxRhKRLIJKO5eBMlQCI8J_HSFTiqz3VAUiAEGHdx-tfgkx7W0TufE2LTltm2x0MXsCWTJbEcnCUppoPBL4BPEUFJuF0C9Z7QDFSVjizOEPwnayCjj4XQR6B3NhUdEojtqLq_EoGWfltaohI0l5QKf20_CQkCpX80yBs8V64Icej4pJ_Cuy-KwOYMrP0pm8rV_wlXHfytY4XatZVlsd24z3BSqcwrUsP_F4By7ZPXMalFtcOPWJMhOp-CACw62rfiMOaxYgKYVFUHmx7PvgtHxcWb02OCQ", asLink: profileAsLink },
      !noHome ? { key: "home", label: "Home", url: "/" } : null,
      (!noUser && profile) ? { key: "profile", label: "My Profile", url: "/profile/", asLink: profileAsLink } : null,
      (!noUser && profile) ? { key: "sign-out", label: "Sign Out", url: "/", onClick: onSignOutClick } : null,
      { key: "how-it-works", label: "How this works?", url: "/how-it-works/" },
      { key: "privacy", label: "Privacy Policy", url: "/privacy/" },
      { key: "terms", label: "Terms", url: "/terms/" },
      { key: "status", label: "Status", url: "https://status.uglyunicorn.ca/", target: "_blank" },
      { key: "buy-me-coffee", label: "Buy me a coffee", url: "https://www.buymeacoffee.com/uglyunicorn", target: "_blank" },
      { key: "github", label: <GitHub size={18} />, menuLabel: <><GitHub size={18} aria-hidden="true" /> GitHub</>, url: "https://github.com/uglyunicorn-eh/santa-barbara", target: "_blank", title: "GitHub" },
    ].filter(Boolean) as MenuItem[],
    [
      profile,
      signOut,
    ],
  );

  // On phones only these two stay in the line; the rest go under "More…".
  const inline = items.filter(({ key }) => COMPACT_KEYS.includes(key));
  const more = items.filter(({ key }) => !COMPACT_KEYS.includes(key));

  return (
    <BulmaFooter className="page-footer">
      <div className="footer-menu max-tablet:hidden">
        <FooterLinks items={items} />
      </div>
      <div className="footer-menu tablet:hidden">
        <FooterLinks items={inline} />
        <span> | </span>
        <MoreMenu items={more} />
      </div>
      <div className="footer-copy is-size-7">
        Made with ❤ in Canada by <a href="https://uglyunicorn.ca" target="_blank">Ugly Unicorn</a>
      </div>
      {children && <div className="is-size-7">{children}</div>}
    </BulmaFooter>
  );
};

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

/** The footer's other links in a small menu that opens upwards; above the garage door (z-index 9999). */
const MoreMenu = ({ items }: { items: MenuItem[] }) => (
  <Menu.Root>
    <Menu.Trigger className={moreTriggerClass}>
      More…
    </Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner side="top" align="center" sideOffset={8} collisionPadding={16} className="z-10000">
        <Menu.Popup className={cn(morePopupClass, "origin-(--transform-origin) transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0")}>
          {items.map(({ key, url, label, menuLabel, asLink, onClick, title, ...rest }) => (
            asLink
              ? <Menu.LinkItem key={key} className={moreItemClass} closeOnClick render={<Link to={url} />}>{menuLabel ?? label}</Menu.LinkItem>
              : <Menu.LinkItem key={key} className={moreItemClass} closeOnClick href={url} onClick={onClick} {...rest}>{menuLabel ?? label}</Menu.LinkItem>
          ))}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
);
