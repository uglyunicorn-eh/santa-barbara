import React from "react";
import { PageFooter } from "@/components/layout";
import { GitHub, Menu as MenuIcon } from 'react-feather';

import { menuItemClass, menuPopupClass } from "@/components/ui/menu";
import { COMPACT_KEYS, moreTriggerClass } from "@/components/hoc/footerMenu";

type Props = {
  children?: React.ReactNode;
};

const items = [
  { key: "home", label: "Home", url: "/" },
  { key: "how-it-works", label: "How this works?", url: "/how-it-works/" },
  { key: "privacy", label: "Privacy Policy", url: "/privacy/" },
  { key: "terms", label: "Terms and Conditions", url: "/terms/" },
  { key: "status", label: "Status", url: "https://status.uglyunicorn.ca/", target: "_blank" },
  { key: "buy-me-coffee", label: "Buy me a coffee", url: "https://www.buymeacoffee.com/uglyunicorn", target: "_blank" },
  { key: "github", label: <GitHub size={18} />, menuLabel: <><GitHub size={18} aria-hidden="true" /> GitHub</>, url: "https://github.com/uglyunicorn-eh/santa-barbara", target: "_blank", title: "GitHub" },
];

type Item = (typeof items)[number];

const Links = ({ list }: { list: Item[] }) => (
  <>
    {list.map(({ key, url, label, menuLabel, ...rest }, index) => (
      <React.Fragment key={key}>
        {index ? <span> | </span> : null}
        <a href={url} {...rest}>{label}</a>
      </React.Fragment>
    ))}
  </>
);

// Static HTML (no script on these pages), so the ☰ menu is a native <details> rather than the app's Base UI menu.
export const AstroFooter = ({ children }: Props) => (
  <PageFooter className="page-footer">
    <div className="footer-menu max-tablet:hidden">
      <Links list={items} />
    </div>
    <div className="footer-menu tablet:hidden">
      <Links list={items.filter(({ key }) => COMPACT_KEYS.includes(key))} />
      <span> | </span>
      <details className="relative">
        <summary className={`${moreTriggerClass} list-none [&::-webkit-details-marker]:hidden`} aria-label="More links" title="More links">
          <MenuIcon size={18} aria-hidden="true" />
        </summary>
        <div className={`${menuPopupClass} absolute right-0 bottom-full z-10 mb-2`}>
          {items.filter(({ key }) => !COMPACT_KEYS.includes(key)).map(({ key, url, label, menuLabel, ...rest }) => (
            <a key={key} href={url} className={menuItemClass} {...rest}>{menuLabel ?? label}</a>
          ))}
        </div>
      </details>
    </div>
    <div className="footer-copy text-xs">
      Made with ❤ in Canada by <a href="https://uglyunicorn.ca" target="_blank">Ugly Unicorn</a>
    </div>
    {children && <div className="text-xs">{children}</div>}
  </PageFooter>
);
