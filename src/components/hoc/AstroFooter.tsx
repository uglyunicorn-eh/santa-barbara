import React from "react";
import { Footer as BulmaFooter } from "react-bulma-components";
import { GitHub } from 'react-feather';

type Props = {
  children?: React.ReactNode;
};

const items = [
  { key: "home", label: "Home", url: "/" },
  { key: "hot-it-works", label: "How this works?", url: "/how-it-works/" },
  { key: "privacy", label: "Privacy Policy", url: "/privacy/" },
  { key: "terms", label: "Terms and Conditions", url: "/terms/" },
  { key: "status", label: "Status", url: "https://status.uglyunicorn.ca/", target: "_blank" },
  { key: "github", label: <GitHub size={18} />, url: "https://github.com/uglyunicorn-eh/santa-barbara", target: "_blank", title: "GitHub" },
];

export const AstroFooter = ({ children }: Props) => (
  <BulmaFooter className="page-footer">
    <div className="footer-menu">
      {items.map(({ key, url, label, ...rest }, index) => (
        <React.Fragment key={key}>
          {index ? <span> | </span> : null}
          <a href={url} {...rest}>{label}</a>
        </React.Fragment>
      ))}
    </div>
    <div className="footer-copy is-size-7">
      Made with ❤ in Canada by <a href="https://uglyunicorn.ca" target="_blank">Ugly Unicorn</a>
    </div>
    {children && <div className="is-size-7">{children}</div>}
  </BulmaFooter >
);
