import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const apiDocsUrl = "https://github.com/NobinSijo7T/aereo-geo-spatial-API";

export function Header() {
  return (
    <header className="glass-nav">
      <div className="flex min-h-14 items-center justify-between gap-8 px-5 sm:px-7">
        <BrandLogo />
        <nav className="flex items-center gap-5 text-sm text-[#6d6d6d]" aria-label="Primary navigation">
          <a className="surface-link hidden items-center gap-1 sm:flex" href={apiDocsUrl} target="_blank" rel="noreferrer">
            API docs <ArrowUpRight size={14} strokeWidth={1.5} />
          </a>
        </nav>
      </div>
    </header>
  );
}
