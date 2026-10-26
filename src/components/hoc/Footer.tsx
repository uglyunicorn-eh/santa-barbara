import React from "react";
import { PageFooter } from "@/components/layout";
import { Menu } from "@base-ui/react/menu";
import { GitHub, Menu as MenuIcon } from 'react-feather';
import { Link } from "react-router-dom";

import { menuItemClass, menuPopupClass, menuPositionerClass } from "@/components/ui/menu";
import { COMPACT_KEYS, moreTriggerClass } from "@/components/hoc/footerMenu";
import { useCurrentUser } from "@/components/hooks";

type Props = {
  children?: React.ReactNode;
  noUser?: boolean;
  noHome?: boolean;
  profileAsLink?: boolean;
};

type MenuItem = {
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
      noHome,
      noUser,
      profile,
      profileAsLink,
      onSignOutClick,
    ],
  );

  // On phones only these two stay in the line; the rest go under a ☰ menu.
  const inline = items.filter(({ key }) => COMPACT_KEYS.includes(key));
  const more = items.filter(({ key }) => !COMPACT_KEYS.includes(key));

  return (
    <PageFooter className="page-footer">
      <div className="footer-menu max-tablet:hidden">
        <FooterLinks items={items} />
      </div>
      <div className="footer-menu tablet:hidden">
        <FooterLinks items={inline} />
        <span> | </span>
        <MoreMenu items={more} />
      </div>
      <div className="footer-copy text-xs">
        Made with ❤ in Canada by <a href="https://uglyunicorn.ca" target="_blank">Ugly Unicorn</a>
      </div>
      {children && <div className="text-xs">{children}</div>}
    </PageFooter>
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

/** The footer's other links in a small menu that opens upwards. */
const MoreMenu = ({ items }: { items: MenuItem[] }) => (
  <Menu.Root>
    <Menu.Trigger className={moreTriggerClass} aria-label="More links" title="More links">
      <MenuIcon size={18} aria-hidden="true" />
    </Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner side="top" align="center" sideOffset={8} collisionPadding={16} className={menuPositionerClass}>
        <Menu.Popup className={menuPopupClass}>
          {items.map(({ key, url, label, menuLabel, asLink, onClick, title: _title, ...rest }) => (
            asLink
              ? <Menu.LinkItem key={key} className={menuItemClass} closeOnClick render={<Link to={url} />}>{menuLabel ?? label}</Menu.LinkItem>
              : <Menu.LinkItem key={key} className={menuItemClass} closeOnClick href={url} onClick={onClick} {...rest}>{menuLabel ?? label}</Menu.LinkItem>
          ))}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
);
