import { Link } from "@tanstack/react-router";
import { club } from "#/lib/club";
import { publicUrl } from "#/lib/public-url";

const items = [
  { to: "/", label: "Home", exact: true },
  { to: "/rosa", label: "Rosa", exact: false },
  { to: "/sfida", label: "Sfida", exact: false },
  { to: "/sfide", label: "Archivio", exact: false },
] as const;

export function SiteNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-pink/30 bg-navy/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:bottom-auto md:top-0 md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-5xl items-center justify-around gap-2 px-3 py-2 md:justify-between md:px-6">
        <Link to="/" className="hidden items-center gap-2 md:flex">
          <img
            src={publicUrl("/brand/logo-sacchos.jpg")}
            alt={club.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-display text-lg tracking-wide text-pink">
            SACCHO'S
          </span>
        </Link>
        <ul className="flex w-full items-center justify-around md:w-auto md:gap-6">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="block min-h-11 px-3 py-2 text-sm font-medium uppercase tracking-wider text-white/80 hover:text-pink"
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
