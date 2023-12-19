import { Message } from "react-bulma-components";

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
