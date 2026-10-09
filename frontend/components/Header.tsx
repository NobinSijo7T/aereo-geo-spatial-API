import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const apiDocsUrl = "https://github.com/NobinSijo7T/aereo-geo-spatial-API";

export function Header() {
  return (
    <header className="glass-nav">
      <div className="flex min-h-14 items-center justify-between gap-8 px-5 sm:px-7">
        <Link href="/" className="brand-mark text-[13px] font-semibold tracking-[.08em]">GEO / STUDIO</Link>
        <nav className="flex items-center gap-5 text-sm text-[#6d6d6d]" aria-label="Primary navigation">
          <a className="surface-link hidden items-center gap-1 sm:flex" href={apiDocsUrl} target="_blank" rel="noreferrer">
            API docs <ArrowUpRight size={14} strokeWidth={1.5} />
          </a>
        </nav>
      </div>
    </header>
  );
}
