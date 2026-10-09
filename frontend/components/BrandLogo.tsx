import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/" className="brand-logo" aria-label="Geo Studio home">
      <svg className="brand-logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#171717" />
        <path d="M7 22.5 22.5 7M7 10.5h14.5v14.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="21.5" cy="10.5" r="3.25" fill="#d9ff5b" />
        <circle cx="21.5" cy="10.5" r="5.75" fill="none" stroke="#d9ff5b" strokeOpacity=".35" strokeWidth="1" />
      </svg>
      <span className="brand-logo__wordmark">GEO / STUDIO</span>
    </Link>
  );
}
