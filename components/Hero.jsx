"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "./Icons";
import { useAccordion } from "./useAccordion";
import Reveal from "./Reveal";

const DEFAULT_OPEN = 2;

const TOURNAMENTS_PHOTO = "/images/hero-tournaments.webp";
const TRAINING_PHOTO = "/images/hero-training.png";
const NEXT_GAME_PHOTO = "/images/hero-next-game.png";
const FIND_PARTNER_PHOTO = "/images/_D2A9966.webp";
const NEWS_PHOTO = "/images/_D2A0257.webp";
const GALLERY_PHOTO = "/images/_D2A0309.webp";

function CardContent({ card }) {
  return (
    <>
      {card.accent && card.photo && (
        <Image
          src={card.photo}
          alt=""
          fill
          sizes="500px"
          unoptimized={card.photo?.startsWith("data:")}
          className="hero__card-photo"
        />
      )}
      <div className="hero__card-top">
        <span
          className={`hero__card-tag${card.accent ? " hero__card-tag--accent" : ""}`}
        >
          {card.tag}
        </span>
        <ArrowUpRight className="hero__card-icon" />
      </div>
      <div className="hero__card-bottom">
        <span className="hero__card-title">{card.title}</span>
        {card.subtitle && (
          <span className="hero__card-subtitle">{card.subtitle}</span>
        )}
      </div>
    </>
  );
}

export default function Hero({ nextGame }) {
  const nextGameCard = nextGame
    ? {
        tag: "Ближайшая игра",
        title: nextGame.title,
        subtitle: [nextGame.dayOfWeek, nextGame.time].filter(Boolean).join(" · "),
        photo: NEXT_GAME_PHOTO,
        accent: true,
        href: "#schedule",
      }
    : {
        tag: "Ближайшая игра",
        title: "Новая игра скоро",
        subtitle: "Следите за обновлениями",
        photo: NEXT_GAME_PHOTO,
        accent: true,
        href: "#schedule",
      };

  const CARDS = [
    { tag: "Турниры", title: "Турниры", photo: TOURNAMENTS_PHOTO, accent: true, href: "#schedule" },
    { tag: "Тренировки", title: "Тренировки", photo: TRAINING_PHOTO, accent: true, href: "#pricing" },
    nextGameCard,
    {
      tag: "Найти партнёра",
      title: "Найти партнёра",
      photo: FIND_PARTNER_PHOTO,
      accent: true,
      href: "#community",
    },
    { tag: "Новости", title: "Новости", photo: NEWS_PHOTO, accent: true, href: "/news" },
    { tag: "Галерея", title: "Галерея", photo: GALLERY_PHOTO, accent: true, href: "#gallery" },
  ];

  const { openIndex, groupProps, itemProps } = useAccordion(DEFAULT_OPEN);
  const sliderRef = useRef(null);

  const scrollSlider = (dir) => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.82 * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__heading">
          <Reveal as="h1" className="hero__heading-line">
            Падел объединяет людей
          </Reveal>
          <Reveal as="h1" className="hero__heading-line" delay={90}>
            и превращает обычную игру
          </Reveal>
          <Reveal
            as="p"
            className="hero__heading-line hero__heading-line--muted"
            delay={180}
          >
            в часть твоей жизни
          </Reveal>
        </div>

        <div className="hero__subtext">
          <Reveal as="p" className="hero__subtext-item" delay={260}>
            Тренировки для любого уровня.
            <br />
            Учись, играй и становись сильнее.
          </Reveal>
          <Reveal
            as="p"
            className="hero__subtext-item hero__subtext-item--right"
            delay={320}
          >
            Турниры и игровые встречи
            <br />
            каждую неделю в Аликанте.
          </Reveal>
        </div>

        {/* Desktop: hover accordion row */}
        <Reveal
          as="div"
          className="hero__cards hero__cards--desktop"
          delay={380}
          {...groupProps}
        >
          {CARDS.map((card, index) => {
            const isOpen = openIndex === index;
            return (
              <Link
                key={card.title}
                href={card.href}
                className={`hero__card${card.accent ? " hero__card--photo" : ""}${
                  isOpen ? " hero__card--open" : ""
                }`}
                {...itemProps(index)}
              >
                <CardContent card={card} />
              </Link>
            );
          })}
        </Reveal>

        {/* Mobile: slider with arrow controls */}
        <Reveal as="div" className="hero__slider-wrap" delay={380}>
          <div className="hero__slider" ref={sliderRef}>
            {CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`hero__card hero__slide${
                  card.accent ? " hero__card--photo" : ""
                }`}
              >
                <CardContent card={card} />
              </Link>
            ))}
          </div>
          <div className="hero__slider-controls">
            <button
              type="button"
              className="hero__slider-arrow"
              aria-label="Предыдущие плитки"
              onClick={() => scrollSlider(-1)}
            >
              <ArrowRight style={{ transform: "rotate(180deg)" }} />
            </button>
            <button
              type="button"
              className="hero__slider-arrow"
              aria-label="Следующие плитки"
              onClick={() => scrollSlider(1)}
            >
              <ArrowRight />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
