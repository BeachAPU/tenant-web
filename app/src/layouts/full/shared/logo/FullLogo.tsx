import type { SVGProps } from 'react';

// Házmester brand mark (same artwork as ../admin/app/src/icons/logo-mark.svg),
// single-colour currentColor so it follows the theme.
export const LogoMark = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 146 132" fill="none" aria-hidden="true" {...props}>
    <path d="M30.4004 0H0V132H30.4004V0Z" fill="currentColor" />
    <path
      d="M60.7924 19.8838V19.8669C47.5759 19.8669 36.6399 30.1262 35.7583 43.289C35.6142 45.4475 35.5548 47.7668 35.5548 50.2386H57.8083V132.008H88.2087V19.8838H60.8009H60.7924Z"
      fill="currentColor"
    />
    <path
      d="M118.592 19.8838V19.8669C105.376 19.8669 94.4396 30.1262 93.558 43.289C93.4138 45.4475 93.3545 47.7668 93.3545 50.2386H115.608V132.008H146.008V19.8838H118.601H118.592Z"
      fill="currentColor"
    />
  </svg>
);

const FullLogo = () => {
  return (
    <span className="flex items-center gap-2">
      <LogoMark width={32} height={29} className="text-[#153CAA] dark:text-white" />
      <span className="text-lg light-logo-text">Házmester</span>
    </span>
  );
};

export default FullLogo;
