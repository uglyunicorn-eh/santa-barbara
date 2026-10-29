import { Link, useMatch } from "react-router-dom";

import { cn } from "@/lib/utils";

/** Route links shown as tabs (the profile dialog): full width, the current one underlined and marked aria-current. */
export const Tabs = ({ label, className, children }: { label: string, className?: string, children: React.ReactNode }) => (
  <nav aria-label={label} className={cn("flex border-b border-border", className)}>
    {children}
  </nav>
);

type Props = {
  children?: React.ReactNode;
  to: string;
};

export const Tab = ({ children, to }: Props) => {
  const active = !!useMatch(to);

  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mb-px flex-1 border-b-2 px-4 py-3 text-center text-xl font-medium whitespace-nowrap transition-colors duration-150",
        "rounded-t-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        active ? "border-link text-link" : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900",
      )}
    >
      {children}
    </Link>
  );
}
