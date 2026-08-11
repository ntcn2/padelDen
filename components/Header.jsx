"use client";

import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon, SendIcon } from "./Icons";
import { NAV_LINKS } from "./navLinks";

const TELEGRAM_URL = "https://t.me/+Hsd53uTBjWc4N2Rk";

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__logo" href="#top">
          <span className="header__logo-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="header__logo-text">
            <span className="header__logo-line">TOP PADEL</span>
            <span className="header__logo-line">ALICANTE</span>
          </span>
        </a>

        <nav className="header__nav" aria-label="Основная навигация">
          {NAV_LINKS.map((link) => (
            <a key={link.label} className="header__nav-link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <a
            className="header__telegram-link"
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SendIcon />
            Telegram
          </a>

          <button
            className="header__menu-button"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div className={`header__mobile-menu${open ? " header__mobile-menu--open" : ""}`}>
        <nav className="header__mobile-nav" aria-label="Мобильная навигация">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              className="header__mobile-nav-link"
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            className="header__mobile-nav-link header__mobile-nav-link--accent"
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <SendIcon />
            Telegram
          </a>
        </nav>
      </div>
    </header>
  );
}
