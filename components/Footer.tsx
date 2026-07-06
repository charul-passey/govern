const LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/charulpassey/" },
  { label: "GitHub", href: "https://github.com/charul-passey/govern" },
  { label: "charulpassey.com", href: "https://charulpassey.com/" },
];

export function Footer() {
  return (
    <footer id="footer" className="border-t border-ink/10 bg-ground px-6 py-12">
      <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-xs text-ink/50">
          An independent concept project. Not affiliated with Ramp. Data cited
          from public sources only.
        </p>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/50">
          {LINKS.map((link, i) => (
            <span key={link.href} className="flex items-center gap-x-3">
              {i > 0 && <span aria-hidden="true">·</span>}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                {link.label}
              </a>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
