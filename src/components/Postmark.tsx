/**
 * A postage stamp with a postmark over it: the reveal reminder's picture (the letter the rolled dialog opens). A red
 * stamp with a cream star in a perforated cream edge, and a grey ink ring with wavy cancel lines stamped across its
 * corner. Reads on dark and on white toasts alike.
 */
export const Postmark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 56 40" width={56} height={40} aria-hidden="true" className={className}>
    {/* The stamp: the dashed stroke is its perforated edge. */}
    <rect x="4" y="4" width="26" height="32" fill="#f6efe1" stroke="#f6efe1" strokeWidth="3" strokeDasharray="1.5 1.5" />
    <rect x="7" y="7" width="20" height="26" fill="#dc2626" />
    <path d="M17 12 l2.4 5 5.4.6 -4 3.7 1.1 5.3 -4.9-2.7 -4.9 2.7 1.1-5.3 -4-3.7 5.4-.6z" fill="#f6efe1" />
    {/* The postmark. */}
    <g fill="none" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="30" cy="22" r="10.5" />
      <path d="M41 17 q3.5 -3 7 0 t7 0 M41 22 q3.5 -3 7 0 t7 0 M41 27 q3.5 -3 7 0 t7 0" />
    </g>
  </svg>
);
