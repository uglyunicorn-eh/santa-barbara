import { Dialog } from '@base-ui/react/dialog';
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
    {/* Fades and grows in, in step with the backdrop and the page stepping back behind a dialog (src/styles/garage.css). */}
    <div className="animate-in fade-in zoom-in-95 duration-250 ease-out motion-reduce:animate-none">
      <Card>
        {closeTo && <CloseX to={closeTo} onEscape={!inDialog} />}
        <Card.Content>
          <img src={hiImg.src} alt="Hi!" className="hi-img" width={250} />

          <Content>
            {children}
          </Content>
        </Card.Content>
      </Card>
    </div>
  </Container>
);

/**
 * The Grinch's card as a dialog over the page (the sign-in form): the page behind stays exactly as it was and doesn't
 * scroll; focus stays inside; Esc, a click on the backdrop and the X go to `closeTo`. A card taller than the window
 * scrolls inside the dialog. Above the garage door (z-index 9999), like the menus.
 */
export const GrinchDialog = ({ closeTo, className, children }: { closeTo: string; className?: string; children?: React.ReactNode }) => {
  useSteppedBack();
  const navigate = useNavigate();
  const onOpenChange = React.useCallback((open: boolean) => { if (!open) navigate(closeTo); }, [navigate, closeTo]);
  // Focus starts on the card, not the X; a field marked `autofocus` takes it next.
  const popupRef = React.useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root open modal onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-10000 bg-black/55 backdrop-blur-[2px] transition-opacity duration-250 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className={cn("fixed inset-0 z-10000 overflow-y-auto overscroll-contain", className)}>
          <div className="flex min-h-full items-center justify-center px-4 pt-[env(safe-area-inset-top,0px)] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
            <Dialog.Popup ref={popupRef} initialFocus={popupRef} className="outline-none">
              <GrinchBox closeTo={closeTo} inDialog>{children}</GrinchBox>
            </Dialog.Popup>
          </div>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/** The black frame around the page behind the dialog, and the page's rounded corners, in screen pixels. */
const FRAME = 20;
/** As long as the step back takes (src/styles/garage.css), so the black stays until the page is full size again. */
const STEP_MS = 250;

let stepForwardDone: ReturnType<typeof setTimeout> | undefined;

const measureStepBack = () => {
  const root = document.documentElement;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = (width - 2 * FRAME) / width;
  // Clip and radius apply before the shrinking: in the page's own pixels.
  const clipY = Math.max(0, FRAME - (height * (1 - scale)) / 2) / scale;
  root.style.setProperty("--behind-scale", String(scale));
  root.style.setProperty("--behind-clip-y", `${clipY}px`);
  root.style.setProperty("--behind-radius", `${FRAME / scale}px`);
};

/**
 * The page steps back for a dialog (on desktop, src/styles/garage.css): it shrinks to leave a black frame of FRAME px
 * on every side, with rounded corners. It shrinks evenly, so on a wide window the shrinking alone leaves less than
 * FRAME above and below: a clip takes the rest off the top and bottom.
 */
const stepBack = () => {
  const root = document.documentElement;
  clearTimeout(stepForwardDone);
  if (root.dataset.behind === "back") {
    return;
  }
  measureStepBack();
  // Full size first, so the step back animates from there.
  root.dataset.behind = "ready";
  void root.offsetWidth;
  root.dataset.behind = "back";
};

/** The page comes forward to full size again; the black goes once it's there. */
const stepForward = () => {
  const root = document.documentElement;
  root.dataset.behind = "ready";
  stepForwardDone = setTimeout(() => {
    delete root.dataset.behind;
    for (const name of ["--behind-scale", "--behind-clip-y", "--behind-radius"]) {
      root.style.removeProperty(name);
    }
  }, STEP_MS);
};

/** The page stays stepped back while the dialog is open (a link straight to it included), and resizes with the window. */
const useSteppedBack = () => {
  React.useEffect(() => {
    stepBack();
    window.addEventListener("resize", measureStepBack);
    return () => {
      window.removeEventListener("resize", measureStepBack);
      stepForward();
    };
  }, []);
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
