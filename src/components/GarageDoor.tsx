import React from "react";

type Props = {
  locked?: boolean;
  doorElement?: React.ReactNode;
  doorRenderer?: () => React.ReactNode;
  children?: React.ReactNode;
}

/** How long the door takes to go up or come down (the transition in src/styles/garage.css). */
const DOOR_MS = 750;

/**
 * shut: the door is down and nothing is behind it. opening: it slides up, the page already behind it. open: it's gone.
 * closing: it slides down over the page, which goes once it's shut.
 */
type Phase = "shut" | "opening" | "open" | "closing";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The garage door over the app while nobody is signed in: it slides up on sign-in and comes down on sign-out. A CSS
 * transition on its `top` (no animation library, so the front door doesn't download one); with reduced motion it
 * just goes.
 */
export const GarageDoor = ({ locked, doorElement, doorRenderer, children }: Props) => {
  const [phase, setPhase] = React.useState<Phase>(locked ? "shut" : "open");
  // Where the door is drawn: up, above the screen, or down over it. It changes a frame after the door shows up, so
  // the move animates from where it was.
  const [up, setUp] = React.useState(!locked);

  const door = React.useMemo(() => doorRenderer ? doorRenderer() : (doorElement ?? <div />), [doorElement]);

  React.useEffect(
    () => {
      if (locked) {
        if (phase === "shut" || phase === "closing") {
          return;
        }
        setPhase("closing");
        if (reducedMotion()) {
          setUp(false);
          setPhase("shut");
          return;
        }
        // Drawn up first (where it was), then down.
        let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setUp(false)); });
        const done = setTimeout(() => setPhase("shut"), DOOR_MS);
        return () => {
          cancelAnimationFrame(frame);
          clearTimeout(done);
        };
      }

      if (phase === "open" || phase === "opening") {
        return;
      }
      setPhase("opening");
      setUp(true);
      if (reducedMotion()) {
        setPhase("open");
        return;
      }
      const done = setTimeout(() => setPhase("open"), DOOR_MS);
      return () => clearTimeout(done);
    },
    // Only a change of `locked` moves the door; `phase` is read for where it is now.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked],
  );

  return (
    <>
      {phase !== "open" && (
        <div className="garage-door" style={{ top: up ? "-105vh" : 0 }}>
          {door}
        </div>
      )}
      {phase !== "shut" && <div className="garage-door-content">{children}</div>}
    </>
  );
};
