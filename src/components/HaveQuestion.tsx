import { buttonVariants } from "@/components/ui/button";
import { DialogFooterStart } from "src/components/DialogBox";

/** "How this works?" on the left of a dialog's footer, opening the guide in a new tab. */
export const HaveQuestion = () => (
  <DialogFooterStart>
    <a href="/how-it-works/" target="_blank" className={buttonVariants({ variant: "ghost" })}>How this works?</a>
  </DialogFooterStart>
);
