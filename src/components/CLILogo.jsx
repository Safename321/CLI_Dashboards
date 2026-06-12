// CLI brand mark — tri-color ring (red/gold/blue) + "CLI" wordmark. SVG so it
// renders at any size with no asset path (works under any base path). Shared by
// the sidebar header, login screen, AI mentor, and OASI views.
const CLI_RED = '#C41E3A';
const CLI_YELLOW = '#DAA520';
const CLI_BLUE = '#2E5090';
const CLI_DARK_BLUE = '#1a365d';

export const CLILogo = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="CLI logo">
    <path d="M50 5 A45 45 0 0 1 95 50" fill="none" stroke={CLI_RED} strokeWidth="8" />
    <path d="M95 50 A45 45 0 0 1 50 95" fill="none" stroke={CLI_YELLOW} strokeWidth="8" />
    <path d="M50 95 A45 45 0 0 1 5 50" fill="none" stroke={CLI_BLUE} strokeWidth="8" />
    <path d="M5 50 A45 45 0 0 1 50 5" fill="none" stroke={CLI_RED} strokeWidth="8" />
    <circle cx="50" cy="50" r="41" fill={CLI_DARK_BLUE} />
    <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="32" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="2">CLI</text>
  </svg>
);

export default CLILogo;
