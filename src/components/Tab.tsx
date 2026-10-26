import { Link, useMatch, useResolvedPath } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
  to: string;
  exact?: boolean;
};

export const Tab = ({ children, to }: Props) => {
  const x = useResolvedPath(to);
  const m = useMatch(to);

  const active = x.pathname === m?.pathname;

  return (
    <li className={active ? "is-active" : ""}>
      <Link to={to}>
        {children}
      </Link>
    </li>
  );
}
