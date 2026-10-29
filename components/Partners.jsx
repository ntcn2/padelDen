import Image from "next/image";
import { ArrowRight, SendIcon } from "./Icons";
import Reveal from "./Reveal";
import { DENIS_TELEGRAM_URL } from "./socialLinks";

// Чтобы добавить логотип: положить файл в public/images/partners/ и указать путь в logo.
// fill — логотип со своим цветным фоном растягивается на всю карточку.
const PARTNERS = [
  { name: "Nox", caption: "Падел-бренд", logo: "/images/partners/nox.png", fill: true },
  { name: "M1 Padel", caption: "Падел-магазин", logo: "/images/partners/m1-padel.png" },
  { name: "El Salt Padel Club", caption: "Падел-клуб", logo: "/images/partners/el-salt.png" },
  { name: "Florex", caption: "Floristería", logo: "/images/partners/florex.png" },
];

export default function Partners() {
  return (
    <section className="partners" id="partners">
      <div className="partners__inner">
        <Reveal as="div" className="section-header">
          <div>
            <p className="eyebrow">Партнёры</p>
            <h2 className="section-title">
              Наши партнёры.
              <br />
              <span className="section-title--muted">Те, кто играет вместе с нами.</span>
            </h2>
          </div>
          <p className="section-subtitle">
            Бренды, клубы и магазины, которые поддерживают сообщество.
          </p>
        </Reveal>

        <div className="partners__grid">
          {PARTNERS.map((partner, i) => (
            <Reveal
              key={partner.name}
              className={`partners__card${partner.fill ? " partners__card--fill" : ""}`}
              delay={i * 80}
            >
              {partner.logo ? (
                <span className="partners__logo">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    sizes="(max-width: 900px) 45vw, 22vw"
                  />
                </span>
              ) : (
                <>
                  <span className="partners__name">{partner.name}</span>
                  <span className="partners__caption">{partner.caption}</span>
                </>
              )}
            </Reveal>
          ))}
        </div>

        <Reveal as="div" className="partners__cta" delay={200}>
          <div className="partners__cta-left">
            <span className="icon-circle partners__cta-icon">
              <SendIcon />
            </span>
            <div>
              <p className="partners__cta-title">Хотите стать нашим партнёром?</p>
              <p className="partners__cta-text">
                Напишите нам в Telegram — обсудим, как можем быть полезны друг другу.
              </p>
            </div>
          </div>
          <a
            className="partners__cta-button"
            href={DENIS_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="icon-circle icon-circle--filled partners__cta-button-icon">
              <ArrowRight />
            </span>
            Написать в Telegram
          </a>
        </Reveal>
      </div>
    </section>
  );
}
