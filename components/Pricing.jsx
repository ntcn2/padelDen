import { ArrowRight, CalendarIcon, UserIcon, UsersIcon } from "./Icons";
import Reveal from "./Reveal";
import { getTrainingOptions, getTrainingPackages } from "@/lib/repositories/trainings";

const OPTION_ICONS = [UserIcon, UsersIcon];

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
              <span className="section-title--muted">удовольствия.</span>
            </h2>
          </Reveal>
          <Reveal as="p" className="section-subtitle" delay={140}>
            Подбираем тренировки под твой уровень
            <br />и цели. Индивидуально или в группе.
          </Reveal>
        </div>

        <div className="pricing__cards">
          {options.map((option, i) => {
            const Icon = OPTION_ICONS[i % OPTION_ICONS.length];
            return (
              <article key={option.id} className="pricing-card">
                <span className="icon-circle pricing-card__icon">
                  <Icon />
                </span>
                <h3 className="pricing-card__title">{option.title}</h3>
                <p className="pricing-card__price">
                  {option.price} <span>/ 1 {option.unit}</span>
                </p>
                {option.note && <p className="pricing-card__note">{option.note}</p>}
                <a className="pricing-card__cta" href={option.registrationUrl || "#"}>
                  <span className="icon-circle icon-circle--sm">
                    <ArrowRight />
                  </span>
                  Записаться
                </a>
              </article>
            );
          })}

          {packages.map((pkg) => (
            <article key={pkg.id} className="pricing-card pricing-card--package">
              <span className="pill pill--accent">{pkg.title}</span>
              <div className="pricing-card__cols">
                {pkg.tiers.map((tier, i) => (
                  <div key={i} className="pricing-card__col">
                    <span className="pricing-card__col-label">
                      {tier.sessionsCount} тренировки
                    </span>
                    <p className="pricing-card__col-price">
                      {tier.oldPrice && <s>{tier.oldPrice}</s>} {tier.price}
                    </p>
                  </div>
                ))}
              </div>
              {(pkg.validityNote || pkg.extraNote) && (
                <p className="pricing-card__note">
                  {pkg.validityNote}
                  {pkg.validityNote && pkg.extraNote && <br />}
                  {pkg.extraNote}
                </p>
              )}
            </article>
          ))}
        </div>

        <div className="pricing__banner">
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
        </div>
      </div>
    </section>
  );
}
