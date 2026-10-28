import Image from "next/image";
import Reveal from "./Reveal";

// Чтобы добавить логотип: положить файл в public/images/partners/ и указать путь в logo.
const PARTNERS = [
  { name: "Nox", caption: "Падел-бренд" },
  { name: "M1 Padel", caption: "Падел-магазин" },
  { name: "El Salt Padel Club", caption: "Падел-клуб" },
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
            <Reveal key={partner.name} className="partners__card" delay={i * 80}>
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
      </div>
    </section>
  );
}
