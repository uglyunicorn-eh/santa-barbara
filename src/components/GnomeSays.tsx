import { Message } from "src/components/bulma";

type Props = {
  variant?: "gnome" | "cupid" | "cupignome";
  children: React.ReactNode;
}

export const GnomeSays = ({
  variant = "gnome",
  children,
}: Props) => (
  <Message className={["gnome-says"].concat(variant).join(" ")}>
    <Message.Body>
      {children}
    </Message.Body>
  </Message>
);
