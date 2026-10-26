import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'react-feather';
import { Card, Container, Content } from "src/components/layout";
import { buttonVariants } from "@/components/ui/button";

import hiImg from "src/images/grinch.png";

type Props = {
  /** Where the X in the top-right corner (and Esc) goes. No X without it. */
  closeTo?: string,
  children?: React.ReactNode,
};

export const GrinchBox = ({ closeTo, children }: Props) => (
  <Container textAlign="centered" className="grinch-box">
    <motion.div
      initial={{ opacity: 0.2, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
    >
      <Card>
        {closeTo && <CloseX to={closeTo} />}
        <Card.Content>
          <img src={hiImg.src} alt="Hi!" className="hi-img" width={250} />

          <Content>
            {children}
          </Content>
        </Card.Content>
      </Card>
    </motion.div>
  </Container>
);

const CloseX = ({ to }: { to: string }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented && !e.isComposing) {
        navigate(to);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, to]);

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      navigate(to);
    },
    [navigate, to],
  );

  return (
    <a
      href={to}
      onClick={onClick}
      aria-label="Close"
      className={buttonVariants({ variant: "ghost", surface: "dark", className: "absolute top-3 right-3 z-10 size-10 px-0" })}
    >
      <X aria-hidden="true" />
    </a>
  );
};
