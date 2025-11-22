import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"; // ⬅️ add this

const socials = [
  { name: "Facebook", href: "https://facebook.com", key: "fb" },
  { name: "X",        href: "https://x.com",        key: "x"  },
  { name: "Instagram",href: "https://instagram.com",key: "ig" },
];

function SocialIcon({ id }) {
  const common = "h-5 w-5";
  switch (id) {
    case "fb":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden="true">
          <path d="M14.5 8.5V7.1c0-1.04.22-1.6 1.82-1.6H18V2.5h-2.45C11.9 2.5 11 4.34 11 6.9v1.6H8v3h3v10h3.5v-10H18l.5-3h-4z"/>
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden="true">
          <path d="M3 3h4.9l5 6.8L17.7 3H21l-6.6 8.7L21 21h-4.9l-5.1-7L6.3 21H3l6.8-9.1L3 3z"/>
        </svg>
      );
    case "ig":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden="true">
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 4.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5zM18 6.75a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-12 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* brand */}
        <div className="text-center">
          <div className="text-xl font-extrabold tracking-tight">
            {t("brand.name")}
          </div>

          <div className="mx-auto mt-2 h-px w-16 bg-gradient-to-r from-amber-500/80 to-rose-500/80 rounded" />

          <p className="mt-3 text-xs text-slate-400">
            &copy; {year} {t("brand.name")} — {t("footer.rights") || "All rights reserved."}
          </p>
        </div>

        {/* socials */}
        <ul className="mt-8 flex items-center justify-center gap-3">
          {socials.map((s) => (
            <li key={s.key}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="group inline-flex items-center justify-center rounded-full p-2.5
                           bg-slate-900/60 ring-1 ring-white/5
                           hover:bg-white hover:text-slate-900
                           transition-all duration-200
                           shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <SocialIcon id={s.key} />
                <span className="sr-only">{s.name}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* quick internal links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <Link
            to="/about"
            className="hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            {t("nav.about")}
          </Link>

          <span className="opacity-30">•</span>

          <Link
            to="/contact"
            className="hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            {t("nav.contact")}
          </Link>

          <span className="opacity-30">•</span>

          <Link
            to="/booking"
            className="hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            {t("nav.book")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
