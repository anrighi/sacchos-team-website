import { Link } from "@tanstack/react-router";
import { club } from "#/lib/club";
import { siteNavItems } from "#/lib/nav";
import { publicUrl } from "#/lib/public-url";

export function SiteNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/75 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:bottom-auto md:top-0 md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-5xl items-center justify-around gap-2 px-3 py-1.5 md:justify-between md:px-6 md:py-2">
        <Link to="/" className="hidden items-center gap-2 md:flex">
          <img
            src={publicUrl("/brand/logo-sacchos.png")}
            alt={club.name}
            className="h-9 w-auto object-contain"
          />
          <span className="font-display text-sm tracking-tight text-white">
            Saccho&apos;s
          </span>
        </Link>
        <ul className="flex w-full items-center justify-around md:w-auto md:gap-7">
          {siteNavItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="flex min-h-11 items-center px-2 font-display text-sm tracking-tight text-white/70 hover:text-white"
                activeProps={{ className: "text-pink" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
