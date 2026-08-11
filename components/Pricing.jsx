import { ArrowRight, CalendarIcon, UserIcon, UsersIcon } from "./Icons";
import Reveal from "./Reveal";
import { getTrainingOptions, getTrainingPackages } from "@/lib/repositories/trainings";
import { formatPrice } from "@/lib/format";

const OPTION_ICONS = [UserIcon, UsersIcon];

function pluralizeSessions(count) {
  const n = Number(count);
  if (!Number.isFinite(n)) return "тренировок";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "тренировка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "тренировки";
  return "тренировок";
}

export default async function Pricing() {
  const [options, packages] = await Promise.all([
    getTrainingOptions(),
    getTrainingPackages(),
  ]);

  return (
    <section className="pricing" id="pricing">
      <div className="pricing__inner">
        <div className="section-header">
          <Reveal>
            <p className="eyebrow">Тренировки</p>
            <h2 className="section-title">
              Играй лучше.
              <br />
              Получай больше
              <br />
              <span className="section-title--accent">удовольствия.</span>
            </h2>
          </Reveal>
          <Reveal as="p" className="section-subtitle section-subtitle--ruled" delay={140}>
            Подбираем тренировки под твой уровень
            <br />и цели. Индивидуально или в группе.
          </Reveal>
        </div>

        <div className="pricing__cards">
          {options.map((option, i) => {
            const Icon = OPTION_ICONS[i % OPTION_ICONS.length];
            const pkg = packages[i];
            return (
              <Reveal
                as="article"
                key={option.id}
                className={`pricing-card${i === 1 ? " pricing-card--dark" : ""}`}
                delay={100 + i * 80}
              >
                <div className="pricing-card__head">
                  <div>
                    <span className="pricing-card__index">
                      {String(i + 1).padStart(2, "0")}.
                    </span>
                    <h3 className="pricing-card__title">{option.title}</h3>
                  </div>
                  <span className="icon-circle pricing-card__icon">
                    <Icon />
                  </span>
                </div>

                <span className="pricing-card__divider" />
                {option.description && (
                  <p className="pricing-card__desc">{option.description}</p>
                )}

                <div className="pricing-card__body">
                  <div className="pricing-card__price">
                    <span className="pricing-card__price-amount">
                      {formatPrice(option.price)}
                    </span>
                    <span className="pricing-card__price-unit">/ {option.unit}</span>
                  </div>

                  {pkg && (
                    <div className="pricing-card__tiers">
                      {pkg.tiers.map((tier, ti) => (
                        <div key={ti} className="pricing-card__tier">
                          <span className="pricing-card__tier-label">
                            {tier.sessionsCount} {pluralizeSessions(tier.sessionsCount)}
                          </span>
                          <span className="pricing-card__tier-price">
                            {tier.oldPrice && <s>{formatPrice(tier.oldPrice)}</s>}
                            {formatPrice(tier.price)}
                          </span>
                          <a
                            className="icon-circle pricing-card__tier-cta"
                            href={pkg.registrationUrl || "#"}
                            aria-label="Записаться"
                          >
                            <ArrowRight />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {option.note && <p className="pricing-card__note">{option.note}</p>}

                <a className="pricing-card__cta" href={option.registrationUrl || "#"}>
                  Записаться на тренировку
                  <span className="icon-circle icon-circle--sm">
                    <ArrowRight />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>

        <Reveal as="div" className="pricing__banner" delay={260}>
          <span className="pricing__banner-watermark" aria-hidden="true">
            PADEL
          </span>
          <div className="pricing__banner-left">
            <span className="icon-circle pricing__banner-icon">
              <CalendarIcon />
            </span>
            <div>
              <p className="pricing__banner-title">Хочешь начать?</p>
              <p className="pricing__banner-text">
                Напиши нам, и мы подберём удобное время
                <br />
                для первой тренировки.
              </p>
            </div>
          </div>
          <a className="pricing__banner-button" href="#">
            Связаться с нами
            <span className="icon-circle icon-circle--sm icon-circle--filled">
              <ArrowRight />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
