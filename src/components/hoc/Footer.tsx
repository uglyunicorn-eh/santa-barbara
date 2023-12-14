import React from "react";
import { Footer as BulmaFooter } from "react-bulma-components";
import { GitHub } from 'react-feather';

import { useCurrentUser } from "src/components/hooks";

import "src/styles/footer.scss";

type Props = {
  children?: React.ReactNode;
};

type MenuItem = {
  label: React.ReactNode;
  url: string;
  target?: string;
  title?: string;
  onClick?: () => void;
};

export const Footer = ({ children }: Props) => {
  const { user, signOut } = useCurrentUser();

  const items = React.useMemo(
    () => [
      { label: "Home", url: "/" },
      user ? { label: "My Profile", url: "/me" } : null,
      user ? { label: "Sign Out", url: "#", onClick: signOut } : null,
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terms and Conditions", url: "/terms" },
      { label: "Status", url: "https://status.uglyunicorn.ca/", target: "_blank" },
      { label: <GitHub size={18} />, url: "https://github.com/uglyunicorn-eh/santa", target: "_blank", title: "GitHub" },
    ].filter(Boolean) as MenuItem[],
    [
      user,
      signOut,
    ],
  );

  return (
    <BulmaFooter className="page-footer">
      <div className="footer-menu">
        {items.map(({ url, label, ...rest }, index) => (
          <React.Fragment key={url}>
            {index ? <span> | </span> : null}
            <a href={url} {...rest}>
              {label}
            </a>
          </React.Fragment>
        ))}
      </div>
      <div className="footer-copy is-size-7">
        Made with ❤ in Canada by <a href="https://uglyunicorn.ca">Ugly Unicorn</a>
      </div>
      {children && <div className="is-size-7">{children}</div>}
    </BulmaFooter>
  );
};
