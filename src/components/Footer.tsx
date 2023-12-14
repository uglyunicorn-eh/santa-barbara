import React from "react";
import Bulma from "react-bulma-components"

import "src/styles/footer.scss";

type Props = {
  children?: React.ReactNode;
};

export const Footer = ({ children }: Props) => {
  const items = React.useMemo(
    () => [
      { label: "Home", url: "/" },
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terns and Conditions", url: "/terms" },
      { label: "Status", url: "https://status.uglyunicorn.ca/" },
    ],
    [],
  );

  return (
    <Bulma.Footer className="page-footer">
      <div className="footer-menu">
        {items.map((item, index) => (
          <React.Fragment key={item.url}>
            {index ? <span> | </span> : null}
            <a href={item.url}>
              {item.label}
            </a>
          </React.Fragment>
        ))}
      </div>
      <div className="footer-copy is-size-7">
        Made with ❤ in Canada by <a href="https://uglyunicorn.ca">Ugly Unicorn</a>
      </div>
      {children && <div className="is-size-7">{children}</div>}
    </Bulma.Footer>
  );
};
