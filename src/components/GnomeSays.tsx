import { Message } from "src/components/bulma";

type Props = {
  variant?: "gnome" | "cupid" | "cupignome";
  /** The gnome stands there saying nothing: the bubble is hidden but keeps its space, so nothing moves. */
  silent?: boolean;
  children?: React.ReactNode;
}

export const GnomeSays = ({
  variant = "gnome",
  silent,
  children,
}: Props) => (
  <Message className={["gnome-says", variant, silent ? "is-silent" : ""].filter(Boolean).join(" ")}>
    <Message.Body>
      {children}
    </Message.Body>
  </Message>
);
