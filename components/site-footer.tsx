import Link from "next/link";

/** Minimal footer: wordmark, one line of positioning, anchor links. */
export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <div className="text-center md:text-left">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight text-foreground"
          >
            Naturalizer<span className="text-primary">.</span>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            Academic writing, edited with care.
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          aria-label="Footer"
        >
          {[
            { href: "#features", label: "Features" },
            { href: "#pricing", label: "Pricing" },
            { href: "#faq", label: "FAQ" },
            { href: "mailto:hello@naturalizer.study", label: "Contact" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Naturalizer
        </p>
      </div>
    </footer>
  );
}
