import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import React from "react";
import { createPortal } from "react-dom";
import { X } from 'react-feather';
import { FormProvider, useForm, useFormState, type FieldValues } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Form, type FormProps } from "@/components/forms/Form";
import { useTabletUp } from "@/components/hooks/useTabletUp";

// The app's dialogs (docs/ui-kit.md, "Dialogs"): from tablet up a centred card on Base UI's Dialog, on phones a bottom
// sheet on Base UI's Drawer that a swipe down closes. Either way focus moves in and Tab stays there, Esc and a click on
// the backdrop close it (going to `dismissLocation`, as the buttons do), the page behind doesn't scroll, and focus goes
// back where it was. Dialogs are routes: open while rendered, closed by navigating away.
//
// The parts carry `dialog-card`, `dialog-head`, `dialog-body` and `dialog-foot`, which each dialog's own artwork styles
// (src/styles/dialog.css) use.

type Props<Values extends FieldValues> = {
  title?: string;
  dismissLocation?: string;
  dismissLabel?: string;
  noDismiss?: boolean;
  action?: React.ReactNode,
  className?: string;
  children?: React.ReactNode;
  form?: FormProps<Values>;
  /** The width from tablet up: sm 600px, md 700px (the default), lg 800px. On phones, a full-width bottom sheet. */
  size?: "sm" | "md" | "lg";
  noHeader?: boolean;
  /** "center": the footer's buttons centred (a dialog with one big action). Default: at the end. */
  footerAlign?: "end" | "center";
  /** Extra classes for the footer (e.g. more room under a big button). */
  footerClassName?: string;
  /** Extra classes for the backdrop behind the card, e.g. a picture instead of the plain dimmed page. */
  backdropClassName?: string;
};

const WIDTHS = { sm: 600, md: 700, lg: 800 };

/** The footer's left side, which content can fill with <DialogFooterStart> (e.g. "Show more parties"). */
const FooterStartContext = React.createContext<HTMLElement | null>(null);

/** Puts its children on the left of the dialog's footer, opposite the dismiss and main actions. */
export const DialogFooterStart = ({ children }: { children: React.ReactNode }) => {
  const slot = React.useContext(FooterStartContext);
  return slot ? createPortal(children, slot) : null;
};

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab and Shift+Tab inside the dialog: from the last control back to the first, and the other way round. */
const trapTab = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key !== "Tab") {
    return;
  }
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>(TABBABLE)]
    .filter(el => !el.hasAttribute("data-base-ui-focus-guard") && el.getClientRects().length > 0);
  if (!items.length) {
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (e.shiftKey ? (active === first || !items.includes(active as HTMLElement)) : active === last) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
};

/**
 * A dialog without a form of its own still gives its footer a form state to read (never submitting), but no <form>
 * element: the content may have forms of its own (the profile), and forms can't nest.
 */
const NoForm = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <div className="flex min-h-0 grow flex-col">{children}</div>
    </FormProvider>
  );
};

/** Tells the dialog whether its form is submitting, so Esc and the backdrop don't close it mid-request. */
const SubmittingWatcher = ({ onChange }: { onChange: (submitting: boolean) => void }) => {
  const { isSubmitting } = useFormState();
  React.useEffect(() => onChange(isSubmitting), [isSubmitting, onChange]);
  return null;
};

const DismissButton = ({ onDismiss, label = 'Nah, never mind' }: { onDismiss: () => void, label?: string }) => {
  const { isSubmitting } = useFormState();
  return <Button type="button" variant="secondary" onClick={onDismiss} disabled={isSubmitting}>{label}</Button>;
};

export const DialogBox = <Values extends FieldValues = FieldValues>({
  title,
  dismissLabel,
  dismissLocation = "/",
  noDismiss,
  className,
  action,
  children,
  form,
  size = "md",
  noHeader = false,
  backdropClassName,
  footerAlign = "end",
  footerClassName,
}: Props<Values>) => {
  const navigate = useNavigate();
  const submitting = React.useRef(false);
  const onSubmittingChange = React.useCallback((value: boolean) => { submitting.current = value; }, []);
  const [footerStart, setFooterStart] = React.useState<HTMLElement | null>(null);
  // Focus starts on the dialog itself, not its first control (a tab, a link); fields marked `autofocus` take it next.
  const popupRef = React.useRef<HTMLDivElement>(null);

  const dismiss = React.useCallback(() => navigate(dismissLocation), [navigate, dismissLocation]);

  // Without a header (no X) and without a dismiss button, nothing closes the dialog but its own action.
  const dismissible = !noHeader || !noDismiss;

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open && dismissible && !submitting.current) {
        dismiss();
      }
    },
    [dismissible, dismiss],
  );

  const tabletUp = useTabletUp();
  const Title = tabletUp ? Dialog.Title : Drawer.Title;

  const card = (
    <>
      <SubmittingWatcher onChange={onSubmittingChange} />
      {/* The sheet's grip, a hint that it swipes away (only when it can be dismissed). */}
      {!tabletUp && dismissible && (
        <div aria-hidden="true" className="dialog-grip absolute top-2 left-1/2 z-30 h-1.5 w-10 -translate-x-1/2 rounded-full bg-zinc-300" />
      )}
      {!noHeader && (
        <header className="dialog-head flex shrink-0 items-center p-5 text-xl text-black [text-shadow:0_1px_2px_white] max-tablet:pt-7 tablet:text-2xl">
          <Title render={<span />}>{title}</Title>
          {/* On a phone's sheet the X sits in the header; from tablet up it's in the page's corner (below). */}
          {!tabletUp && (
            <Button
              variant="ghost"
              className="-my-2 -mr-2 ml-auto size-10 shrink-0 px-0 text-zinc-700"
              aria-label="Close"
              onClick={dismiss}
            >
              <X size={24} aria-hidden="true" />
            </Button>
          )}
        </header>
      )}
      <div className="dialog-body min-h-0 grow overflow-auto p-5 text-lg">
        {children}
      </div>
      <footer className={cn("dialog-foot flex shrink-0 flex-col-reverse items-stretch gap-4 rounded-b-card p-5 tablet:flex-row tablet:items-center tablet:gap-2", footerAlign === "center" ? "tablet:justify-center" : "tablet:justify-end", footerClassName)}>
        <div ref={setFooterStart} className="contents empty:hidden tablet:mr-auto tablet:flex tablet:items-center" />
        {!noDismiss && <DismissButton onDismiss={dismiss} label={dismissLabel} />}
        {action}
      </footer>
    </>
  );

  const content = (
    <FooterStartContext.Provider value={footerStart}>
      {form
        ? <Form {...form} className="flex min-h-0 grow flex-col">{card}</Form>
        : <NoForm>{card}</NoForm>}
    </FooterStartContext.Provider>
  );

  return (
    <>
      {/* An empty <title> would replace the page's; dialogs without one leave it to their content. */}
      {title && <title>{title}</title>}
      {tabletUp
        ? (
          <Dialog.Root open modal onOpenChange={onOpenChange} disablePointerDismissal={!dismissible}>
            <Dialog.Portal>
              <Dialog.Backdrop className={cn("fixed inset-0 z-40 bg-black/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0", backdropClassName)} />
              <Dialog.Viewport
                className={cn("dialog fixed inset-0 z-40 flex items-center justify-center overflow-hidden", className)}
                onKeyDown={trapTab}
              >
                <Dialog.Popup
                  ref={popupRef}
                  initialFocus={popupRef}
                  className="dialog-card relative mx-auto flex max-h-[calc(100vh-40px)] w-160 max-w-[calc(100vw-60px)] flex-col overflow-hidden rounded-card bg-white shadow-lg outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
                  style={{ width: WIDTHS[size] }}
                >
                  {/* In the page's top-right corner, but inside the popup so Tab reaches it in order. */}
                  {!noHeader && (
                    <Button
                      variant="ghost"
                      surface="dark"
                      className="fixed top-4 right-4 z-10 size-10 px-0"
                      aria-label="Close"
                      onClick={dismiss}
                    >
                      <X size={28} aria-hidden="true" />
                    </Button>
                  )}
                  {content}
                </Dialog.Popup>
              </Dialog.Viewport>
            </Dialog.Portal>
          </Dialog.Root>
        )
        : (
          // A bottom sheet: it slides up, and a swipe down closes it like the backdrop does.
          <Drawer.Root open modal swipeDirection="down" onOpenChange={onOpenChange} disablePointerDismissal={!dismissible}>
            <Drawer.Portal>
              <Drawer.Backdrop className={cn("fixed inset-0 z-40 bg-black/60 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-300 data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0", backdropClassName)} />
              <Drawer.Viewport
                className={cn("dialog is-sheet fixed inset-0 z-40 flex items-end justify-center overflow-hidden", className)}
                onKeyDown={trapTab}
              >
                <Drawer.Popup
                  ref={popupRef}
                  initialFocus={popupRef}
                  className="dialog-card relative flex max-h-[calc(100dvh-24px)] w-full flex-col overflow-hidden rounded-t-card bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-lg outline-none [transform:translateY(var(--drawer-swipe-movement-y,0px))] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-swiping:duration-0 data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)]"
                >
                  {content}
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        )}
    </>
  );
};
