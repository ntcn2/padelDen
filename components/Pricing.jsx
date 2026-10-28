import { ArrowRight, CalendarIcon, UserIcon, UsersIcon } from "./Icons";
import Reveal from "./Reveal";
import { DENIS_TELEGRAM_URL } from "./socialLinks";
import { getTrainingOptions, getTrainingPackages } from "@/lib/repositories/trainings";

const OPTION_ICONS = [UserIcon, UsersIcon];

// Цены на сайте не показываем — только что входит в тренировку.
// Цены по-прежнему ведутся в админке: из них считается выгода пакетов.
const OPTION_PERKS = [
  ["Тренер работает только с тобой", "План под твой уровень и цели", "Разбор техники и ошибок"],
  ["Игроки твоего уровня", "Игровые упражнения и розыгрыши", "Новые партнёры для игры"],
];

function pluralizeSessions(count) {
  const n = Number(count);
  if (!Number.isFinite(n)) return "тренировок";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "тренировка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "тренировки";
  return "тренировок";
}

const CONTACT_URL = DENIS_TELEGRAM_URL;

function priceRequestUrl(title) {
  const text = `Здравствуйте! Подскажите, пожалуйста, стоимость: ${title.toLowerCase()}`;
  return `${DENIS_TELEGRAM_URL}?text=${encodeURIComponent(text)}`;
}

// «Пакеты на 4 и 8 тренировок», «выгоднее до 25%» — без самих цен.
function packageHint(pkg) {
  const tiers = pkg?.tiers.filter((t) => Number(t.sessionsCount) > 0) ?? [];
  if (tiers.length === 0) return null;
  const counts = tiers.map((t) => Number(t.sessionsCount));
  const last = counts[counts.length - 1];
  const label = `Пакеты на ${counts.length > 1 ? `${counts.slice(0, -1).join(", ")} и ` : ""}${last} ${pluralizeSessions(last)}`;
  const discount = Math.max(
    0,
    ...tiers.map((t) =>
      Number(t.oldPrice) > 0 && Number(t.price) > 0
        ? Math.round((1 - Number(t.price) / Number(t.oldPrice)) * 100)
        : 0
    )
  );
  return { label, discount };
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
            const hint = packageHint(packages[i]);
            const perks = OPTION_PERKS[i % OPTION_PERKS.length];
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

                <ul className="pricing-card__perks">
                  {perks.map((perk) => (
                    <li key={perk} className="pricing-card__perk">
                      {perk}
                    </li>
                  ))}
                </ul>

                {hint && (
                  <div className="pricing-card__package">
                    <span className="pricing-card__package-label">{hint.label}</span>
                    {hint.discount > 0 && (
                      <span className="pricing-card__package-badge">
                        выгоднее до {hint.discount}%
                      </span>
                    )}
                  </div>
                )}

                <a
                  className="pricing-card__cta"
                  href={priceRequestUrl(option.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="icon-circle pricing-card__cta-icon">
                    <ArrowRight />
                  </span>
                  Узнать стоимость
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
