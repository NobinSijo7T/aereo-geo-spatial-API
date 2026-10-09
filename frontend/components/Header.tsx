import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const apiDocsUrl = "https://github.com/NobinSijo7T/aereo-geo-spatial-API";

export function Header() {
  return (
    <header className="border-b hairline bg-white">
      <div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-8 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="text-[15px] font-semibold tracking-[-0.02em]">GEO / STUDIO</Link>
        <nav className="flex items-center gap-5 text-sm text-[#6d6d6d]" aria-label="Primary navigation">
          <Link href="/" className="surface-link text-[#181818]">Workspace</Link>
          <a className="surface-link hidden items-center gap-1 sm:flex" href={apiDocsUrl} target="_blank" rel="noreferrer">
            API docs <ArrowUpRight size={14} strokeWidth={1.5} />
          </a>
        </nav>
      </div>
    </header>
  );
}
