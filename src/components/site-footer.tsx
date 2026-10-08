import { LogoMark } from "@/components/logo";
import { CONTAINER } from "@/components/primitives";
import { CONTACT, NAV_LINKS } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-10">
      <div
        className={`${CONTAINER} flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-7" />
          <p className="text-[13px] text-muted">
            © {year} Lima Silva · Software sob medida
          </p>
        </div>

        <nav aria-label="Rodapé">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[13px] text-muted transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-[13px] font-medium text-ink transition-colors duration-200 hover:text-brand"
              >
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
