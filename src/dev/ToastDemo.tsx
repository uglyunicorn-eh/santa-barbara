import React from "react";

import { Button } from "@/components/ui/button";
import { NotificationsContainer, remind, useNotifications, useToastSurface } from "@/components/hoc/NotificationsContainer";

// The kit's live toasts: the app's own toaster and calls, on the dark (night pages) or light (party page) surface.

type Tone = "dark" | "light";

const Surface = ({ tone }: { tone: Tone }) => {
  useToastSurface(tone);
  return null;
};

let reminders = 0;

export const ToastDemo = ({ tone, longEmail }: { tone: Tone; longEmail: string }) => {
  const { error, success } = useNotifications();
  const [active, setActive] = React.useState(false);
  // Only the panel last clicked sets the surface, so the two panels don't fight over it.
  const fire = (show: () => void) => {
    window.dispatchEvent(new CustomEvent("kit-toast-surface", { detail: tone }));
    setActive(true);
    show();
  };

  React.useEffect(
    () => {
      const onOther = (event: Event) => setActive((event as CustomEvent<Tone>).detail === tone);
      window.addEventListener("kit-toast-surface", onOther);
      return () => window.removeEventListener("kit-toast-surface", onOther);
    },
    [tone],
  );

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {active && <Surface tone={tone} />}
      {/* One toaster for the page: the dark panel mounts it. */}
      {tone === "dark" && <NotificationsContainer />}
      <Button variant="secondary" size="sm" surface={tone} onClick={() => fire(() => error("Party is already packed. Sorry, we cannot accept a new participant..."))}>
        Error
      </Button>
      <Button variant="secondary" size="sm" surface={tone} onClick={() => fire(() => error(`We couldn't send a link to ${longEmail}. Please try again in a bit.`))}>
        Long error
      </Button>
      <Button variant="secondary" size="sm" surface={tone} onClick={() => fire(() => success("Done! We've sent a magic link to your inbox."))}>
        Success
      </Button>
      <Button
        variant="secondary"
        size="sm"
        surface={tone}
        onClick={() => fire(() => remind({
          id: `kit-reminder-${++reminders}`,
          title: "🎲 The dice are rolled!",
          description: <>In <strong className="font-semibold text-current wrap-anywhere">Office Secret Santa 2026</strong>. Find out whom you give a gift to.</>,
          action: { label: "Open", onClick: () => undefined },
        }))}
      >
        Reminder
      </Button>
    </div>
  );
};
