import React from "react";
import { Footer as BulmaFooter } from "src/components/bulma";
import { GitHub } from 'react-feather';

import { COMPACT_KEYS, moreItemClass, morePopupClass, moreTriggerClass } from "src/components/hoc/footerMenu";

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

type Item = (typeof items)[number] & { menuLabel?: React.ReactNode };

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

// Static HTML (no script on these pages), so "More…" is a native <details> rather than the app's menu.
export const AstroFooter = ({ children }: Props) => (
  <BulmaFooter className="page-footer">
    <div className="footer-menu max-tablet:hidden">
      <Links list={items} />
    </div>
    <div className="footer-menu tablet:hidden">
      <Links list={items.filter(({ key }) => COMPACT_KEYS.includes(key))} />
      <span> | </span>
      <details className="relative">
        <summary className={`${moreTriggerClass} list-none [&::-webkit-details-marker]:hidden`}>More…</summary>
        <div className={`${morePopupClass} absolute right-0 bottom-full z-10 mb-2`}>
          {(items as Item[]).filter(({ key }) => !COMPACT_KEYS.includes(key)).map(({ key, url, label, menuLabel, ...rest }) => (
            <a key={key} href={url} className={moreItemClass} {...rest}>{menuLabel ?? label}</a>
          ))}
        </div>
      </details>
    </div>
    <div className="footer-copy is-size-7">
      Made with ❤ in Canada by <a href="https://uglyunicorn.ca" target="_blank">Ugly Unicorn</a>
    </div>
    {children && <div className="is-size-7">{children}</div>}
  </BulmaFooter>
);
