type Props = {
  label?: string;
};

/** A vertical line between two columns with a word in the middle ("OR" on the start page). */
export const Divider = ({ label = "or" }: Props) => (
  <div className="relative min-h-8 flex-none self-stretch p-8" aria-hidden="true">
    <span className="absolute inset-y-4 left-1/2 -translate-x-1/2 border-l-[0.1rem] border-zinc-300" />
    <span className="absolute top-1/2 left-1/2 -translate-1/2 bg-night p-0.5 text-xs text-zinc-400">{label}</span>
  </div>
);
