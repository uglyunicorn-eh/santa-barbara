import { Dialog } from "@base-ui/react/dialog";
import { Formik, useFormikContext, type FormikConfig, type FormikValues } from "formik";
import React from "react";
import { createPortal } from "react-dom";
import { X } from 'react-feather';
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Form } from "src/components/forms";

// The app's dialogs (docs/ui-kit.md, "Dialogs"), on Base UI's Dialog: focus moves into the dialog and Tab stays there,
// Esc and a click on the backdrop close it (going to `dismissLocation`, as the buttons do), the page behind doesn't
// scroll, and focus goes back where it was. Dialogs are routes: open while rendered, closed by navigating away.
//
// The parts carry `dialog-card`, `dialog-head`, `dialog-body` and `dialog-foot`, which each dialog's own artwork styles
// (src/styles/dialog.scss) use.

type Props<Values extends FormikValues> = {
  title?: string;
  dismissLocation?: string;
  dismissLabel?: string;
  noDismiss?: boolean;
  action?: React.ReactNode,
  className?: string;
  children?: React.ReactNode;
  form?: FormikConfig<Values>;
  cardStyle?: React.CSSProperties;
  noHeader?: boolean;
};

/** The footer's left side, which content can fill with <DialogFooterStart> (e.g. "Show more parties"). */
const FooterStartContext = React.createContext<HTMLElement | null>(null);

/** Puts its children on the left of the dialog's footer, opposite the dismiss and main actions. */
export const DialogFooterStart = ({ children }: { children: React.ReactNode }) => {
  const slot = React.useContext(FooterStartContext);
  return slot ? createPortal(children, slot) : null;
};

/** Tells the dialog whether its form is submitting, so Esc and the backdrop don't close it mid-request. */
const SubmittingWatcher = ({ onChange }: { onChange: (submitting: boolean) => void }) => {
  const { isSubmitting } = useFormikContext();
  React.useEffect(() => onChange(isSubmitting), [isSubmitting, onChange]);
  return null;
};

const DismissButton = ({ onDismiss, label = 'Nah, never mind' }: { onDismiss: () => void, label?: string }) => {
  const { isSubmitting } = useFormikContext();
  return <Button type="reset" variant="secondary" onClick={onDismiss} disabled={isSubmitting}>{label}</Button>;
};

export const DialogBox = <Values extends FormikValues = FormikValues>({
  title,
  dismissLabel,
  dismissLocation = "/",
  noDismiss,
  className,
  action,
  children,
  form,
  cardStyle,
  noHeader = false,
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

  const card = (
    <>
      <SubmittingWatcher onChange={onSubmittingChange} />
      {!noHeader && (
        <header className="dialog-head flex shrink-0 items-center p-5 text-xl text-black [text-shadow:0_1px_2px_white] tablet:text-2xl">
          <Dialog.Title render={<span />}>{title}</Dialog.Title>
        </header>
      )}
      <div className="dialog-body min-h-0 grow overflow-auto p-5 text-lg">
        {children}
      </div>
      <footer className="dialog-foot flex shrink-0 flex-col-reverse items-stretch gap-4 rounded-b-card p-5 tablet:flex-row tablet:items-center tablet:justify-end tablet:gap-2">
        <div ref={setFooterStart} className="contents tablet:mr-auto tablet:flex tablet:items-center" />
        {!noDismiss && <DismissButton onDismiss={dismiss} label={dismissLabel} />}
        {action}
      </footer>
    </>
  );

  return (
    <>
      {/* An empty <title> would replace the page's; dialogs without one leave it to their content. */}
      {title && <title>{title}</title>}
      <Dialog.Root open modal onOpenChange={onOpenChange} disablePointerDismissal={!dismissible}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Viewport className={cn("dialog fixed inset-0 z-40 flex items-center justify-center overflow-hidden", className)}>
            {!noHeader && (
              <Button
                variant="ghost"
                surface="dark"
                className="fixed top-4 right-4 z-10 size-10 px-0 max-tablet:hidden"
                aria-label="Close"
                onClick={dismiss}
              >
                <X size={28} aria-hidden="true" />
              </Button>
            )}
            <Dialog.Popup
              ref={popupRef}
              initialFocus={popupRef}
              className="dialog-card relative mx-4 flex max-h-[calc(100vh-40px)] w-full max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-card bg-white shadow-lg outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 tablet:mx-auto tablet:w-160 tablet:max-w-[calc(100vw-60px)]"
              style={cardStyle}
            >
              <FooterStartContext.Provider value={footerStart}>
                {form
                  ? <Form {...form} className="flex min-h-0 grow flex-col">{card}</Form>
                  : <Formik onSubmit={() => undefined} initialValues={{}}><div className="flex min-h-0 grow flex-col">{card}</div></Formik>}
              </FooterStartContext.Provider>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
