interface ExternalArrowProps {
  className?: string;
}

export const ExternalArrow = ({ className = "" }: ExternalArrowProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    className={`h-[0.9em] w-[0.9em] shrink-0 ${className}`}
  >
    <path
      d="M4 12 12 4M6 4h6v6"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);
