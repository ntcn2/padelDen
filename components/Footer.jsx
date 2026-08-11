import {
  InstagramIcon,
  PinIcon,
  SendIcon,
  WhatsappIcon,
} from "./Icons";
import { NAV_LINKS } from "./navLinks";

const TELEGRAM_URL = "https://t.me/+Hsd53uTBjWc4N2Rk";

const CONTACTS = [
  { Icon: PinIcon, label: "Aликанте, Испания", href: "#" },
  { Icon: InstagramIcon, label: "Instagram", href: "#" },
  { Icon: SendIcon, label: "Telegram", href: TELEGRAM_URL },
  { Icon: WhatsappIcon, label: "WhatsApp", href: "#" },
];

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__inner">
        <div className="footer__divider" />

        <div className="footer__row">
          <div className="footer__logo">
            <span className="footer__logo-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="footer__logo-text">
              <span>TOP PADEL</span>
              <span>ALICANTE</span>
            </span>
          </div>

          <div className="footer__col">
            <p className="footer__col-title">Навигация</p>
            <ul className="footer__list">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <p className="footer__col-title">Контакты</p>
            <ul className="footer__list">
              {CONTACTS.map(({ Icon, label, href }) => (
                <li key={label} className="footer__contact-row">
                  <Icon />
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col footer__col--desc">
            <p className="footer__description">
              Сообщество игроков
              <br />
              и любителей падела в Аликанте.
              <br />
              Играем. Тренируемся. Растём вместе.
            </p>
            <div className="footer__socials">
              <a className="icon-circle footer__social" href="#">
                <InstagramIcon />
              </a>
              <a
                className="icon-circle footer__social"
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SendIcon />
              </a>
              <a className="icon-circle footer__social" href="#">
                <WhatsappIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="footer__divider" />

        <div className="footer__legal">
          <span>© 2026 Top Padel Alicante</span>
          <span className="footer__legal-links">
            <a href="#">Политика конфиденциальности</a>
            <span className="footer__legal-dot" aria-hidden="true" />
            <a href="#">Cookies</a>
          </span>
        </div>

        <div className="footer__watermark-wrap">
          <span className="footer__watermark">TOP PADEL ALICANTE</span>
        </div>
      </div>
    </footer>
  );
}
