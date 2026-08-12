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

const CONTACT_URL = "https://t.me/denystia";

function formatPriceParts(value, unit) {
  const formatted = formatPrice(value);
  const euroIndex = formatted.lastIndexOf("€");
  if (euroIndex === -1) return { amount: formatted, currency: "" };
  return {
    amount: formatted.slice(0, euroIndex).trimEnd(),
    currency: formatted.slice(euroIndex),
  };
}

export default async function Pricing() {
  const [options, packages] = await Promise.all([
    getTrainingOptions(),
    getTrainingPackages(),
  ]);

  return (
    <section className="pricing" id="pricing">
      <div className="pricing__inner">
        <div className="pricing__header">
          <Reveal>
            <p className="eyebrow">Тренировки</p>
            <h2 className="pricing__title">
              <span className="pricing__title-line">Играй лучше.</span>
              <span className="pricing__title-line">Получай больше</span>
              <span className="pricing__title-line pricing__title-line--muted">
                удовольствие
              </span>
            </h2>
          </Reveal>
          <Reveal as="div" className="pricing__subtitle-wrap" delay={140}>
            <span className="pricing__subtitle-divider" aria-hidden="true" />
            <p className="pricing__subtitle-text">
              Подбираем тренировки под твой уровень
              <br />и цели. Индивидуально или в группе.
            </p>
          </Reveal>
        </div>

        <div className="pricing__cards">
          {options.map((option, i) => {
            const Icon = OPTION_ICONS[i % OPTION_ICONS.length];
            const pkg = packages[i];
            const { amount, currency } = formatPriceParts(option.price);
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
                      {amount} <span className="pricing-card__price-currency">{currency}</span>
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {option.note && <p className="pricing-card__note">{option.note}</p>}

                <a className="pricing-card__cta" href={option.registrationUrl || "#"}>
                  <span className="icon-circle pricing-card__cta-icon">
                    <ArrowRight />
                  </span>
                  Записаться
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
          <a
            className="pricing__banner-button"
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="icon-circle icon-circle--filled pricing__banner-button-icon">
              <ArrowRight />
            </span>
            Связаться с нами
          </a>
        </Reveal>
      </div>
    </section>
  );
}
