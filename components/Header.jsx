"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CloseIcon, MenuIcon, SendIcon } from "./Icons";
import { NAV_LINKS } from "./navLinks";
import { TELEGRAM_URL } from "./socialLinks";

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
        <Link className="header__logo" href="/">
          <Image className="header__logo-mark" src="/images/logo.jpg" alt="" width={112} height={112} preload />
          <span className="header__logo-text">
            <span className="header__logo-line">TOP PADEL</span>
            <span className="header__logo-line">ALICANTE</span>
          </span>
        </Link>

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
