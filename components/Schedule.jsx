"use client";

import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  ClockIcon,
  GridIcon,
  PinIcon,
  UsersIcon,
} from "./Icons";
import { useAccordion } from "./useAccordion";
import Reveal from "./Reveal";
import { formatPrice } from "@/lib/format";

function formatRuDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long" }).format(
      new Date(`${dateStr}T00:00:00`)
    );
  } catch {
    return dateStr;
  }
}

function buildMeta(game) {
  const rows = [];
  if (game.participantsType && game.participantsCount) {
    rows.push([
      UsersIcon,
      `${game.participantsCount} ${game.participantsType === "pairs" ? "пар" : "игроков"}`,
    ]);
  }
  if (game.courtsCount) rows.push([GridIcon, `${game.courtsCount} корта`]);
  if (game.time) rows.push([ClockIcon, game.time]);
  if (game.location) rows.push([PinIcon, game.location]);
  return rows;
}

export default function Schedule({ games }) {
  const { openIndex, groupProps, itemProps } = useAccordion(0);

  return (
    <section className="schedule" id="schedule">
      <div className="schedule__inner">
        <div className="section-header">
          <Reveal>
            <p className="eyebrow">Ближайшие игры</p>
            <h2 className="section-title">
              На этой неделе
              <br />
              встречаемся на корте
            </h2>
          </Reveal>
          <Reveal as="p" className="section-subtitle" delay={140}>
            Выбирай игру под свой уровень
            <br />и присоединяйся.
          </Reveal>
        </div>

        {games.length === 0 ? (
          <p className="section-subtitle">Скоро объявим новые игры.</p>
        ) : (
          <div className="schedule__cards" {...groupProps}>
            {games.map((game, index) => {
              const isOpen = openIndex === index;
              const meta = buildMeta(game);
              return (
                <article
                  key={game.id}
                  className={`schedule__card${isOpen ? " schedule__card--open" : ""}`}
                  {...itemProps(index)}
                >
                  {game.photo && (
                    <Image
                      src={game.photo}
                      alt=""
                      fill
                      sizes="800px"
                      unoptimized={game.photo.startsWith("data:")}
                      className="schedule__card-photo"
                    />
                  )}
                  <div className="schedule__card-top">
                    <span className="schedule__card-tag">
                      {formatRuDate(game.date)}
                      {game.dayOfWeek ? ` · ${game.dayOfWeek}` : ""}
                    </span>
                  </div>

                  <div className="schedule__card-body">
                    <h3 className="schedule__card-title">{game.title}</h3>
                    {meta.length > 0 && (
                      <ul className="schedule__card-meta">
                        {meta.map(([Icon, label]) => (
                          <li key={label} className="schedule__card-meta-row">
                            <Icon className="schedule__card-meta-icon" />
                            <span>{label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {game.extraText && (
                      <p className="schedule__card-meta-row">{game.extraText}</p>
                    )}
                  </div>

                  <div className="schedule__card-footer">
                    <span className="schedule__card-price">{formatPrice(game.price)}</span>
                    <a
                      href={game.registrationUrl || "#"}
                      className="schedule__card-cta"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowRight />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <a className="link-arrow schedule__link" href="#">
          Все игры и мероприятия
          <ArrowUpRight />
        </a>
      </div>
    </section>
  );
}
