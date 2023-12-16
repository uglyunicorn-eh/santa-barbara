import "src/styles/divider.scss";

type Props = {
  label?: string;
  vertical?: boolean;
  labelInverted?: boolean;
}

export const Divider = ({ label, vertical, labelInverted }: Props) => (
  <div
    className={`
      ${labelInverted ? 'is-inverted' : ''}
      ${vertical ? 'is-divider-vertical' : 'is-divider'}
    `.trim()}
    data-content={label ?? 'or'}
  />
)
