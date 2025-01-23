export const FollowIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Circle */}
      <circle cx="12" cy="12" r="10" />
      {/* Horizontal line for cross */}
      <line x1="12" y1="8" x2="12" y2="16" />
      {/* Vertical line for cross */}
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
};
