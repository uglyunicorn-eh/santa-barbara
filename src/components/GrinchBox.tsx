import { Dialog } from '@base-ui/react/dialog';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'react-feather';
import { Card, Container, Content } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import hiImg from "@/images/grinch.png";

type Props = {
  /** Where the X in the top-right corner (and Esc) goes. No X without it. */
  closeTo?: string,
  /** In a dialog, which handles Esc itself: the X only. */
  inDialog?: boolean,
  children?: React.ReactNode,
};

export const GrinchBox = ({ closeTo, inDialog = false, children }: Props) => (
  <Container textAlign="centered" className="grinch-box">
    <motion.div
      initial={{ opacity: 0.2, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
    >
      <Card>
        {closeTo && <CloseX to={closeTo} onEscape={!inDialog} />}
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

/**
 * The Grinch's card as a dialog over the page (the sign-in form): the page behind stays exactly as it was and doesn't
 * scroll; focus stays inside; Esc, a click on the backdrop and the X go to `closeTo`. A card taller than the window
 * scrolls inside the dialog. Above the garage door (z-index 9999), like the menus.
 */
export const GrinchDialog = ({ closeTo, className, children }: { closeTo: string; className?: string; children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const onOpenChange = React.useCallback((open: boolean) => { if (!open) navigate(closeTo); }, [navigate, closeTo]);
  // Focus starts on the card, not the X; a field marked `autofocus` takes it next.
  const popupRef = React.useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root open modal onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-10000 bg-black/55 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className={cn("fixed inset-0 z-10000 overflow-y-auto overscroll-contain", className)}>
          <div className="flex min-h-full items-center justify-center px-4 pb-8">
            <Dialog.Popup ref={popupRef} initialFocus={popupRef} className="outline-none">
              <GrinchBox closeTo={closeTo} inDialog>{children}</GrinchBox>
            </Dialog.Popup>
          </div>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const CloseX = ({ to, onEscape }: { to: string; onEscape: boolean }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!onEscape) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented && !e.isComposing) {
        navigate(to);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, to, onEscape]);

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
