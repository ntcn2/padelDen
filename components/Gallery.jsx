"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "./Icons";
import { useAccordion } from "./useAccordion";
import Reveal from "./Reveal";

function GalleryRow({ images }) {
  const { openIndex, groupProps, itemProps } = useAccordion(0);

  return (
    <div className="gallery__row" {...groupProps}>
      {images.map((img, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={img.id}
            className={`gallery__item${isOpen ? " gallery__item--open" : ""}`}
            {...itemProps(index)}
          >
            <Image
              src={img.src}
              alt={img.alt || ""}
              fill
              sizes="600px"
              unoptimized={img.src?.startsWith("data:")}
              className="gallery__item-photo"
            />
          </div>
        );
      })}
    </div>
  );
}

export default function Gallery({ categories, photos }) {
  const [categoryId, setCategoryId] = useState("all");
  const isAll = categoryId === "all";

  const visible = useMemo(
    () => (isAll ? photos : photos.filter((p) => p.categoryId === categoryId)),
    [isAll, categoryId, photos]
  );

  const row1 = photos.slice(0, 4);
  const row2 = photos.slice(4, 8);

  return (
    <section className="gallery" id="gallery">
      <div className="gallery__inner">
        <div className="section-header">
          <Reveal>
            <p className="eyebrow">Галерея</p>
            <h2 className="section-title">
              Здесь всё
              <br />
              происходит по-настоящему
            </h2>
          </Reveal>
          <Reveal as="p" className="section-subtitle" delay={140}>
            Тренировки, турниры, победы, ошибки,
            <br />
            новые знакомства и просто хорошие
            <br />
            вечера на корте.
          </Reveal>
        </div>

        <div className="gallery__filters">
          <div className="tabs">
            <button
              type="button"
              className={`tab${isAll ? " tab--active" : ""}`}
              onClick={() => setCategoryId("all")}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`tab${cat.id === categoryId ? " tab--active" : ""}`}
                onClick={() => setCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {photos.length === 0 ? (
          <p className="section-subtitle">Скоро добавим фотографии.</p>
        ) : (
          <>
            {isAll && (
              <div className="gallery__grid gallery__grid--desktop">
                <GalleryRow images={row1} />
                {row2.length > 0 && <GalleryRow images={row2} />}
              </div>
            )}

            <div
              className={`gallery__flat${isAll ? " gallery__flat--mobile-only" : ""}`}
            >
              {visible.map((photo) => (
                <div key={photo.id} className="gallery__flat-item">
                  <Image
                    src={photo.src}
                    alt={photo.alt || ""}
                    fill
                    sizes="600px"
                    unoptimized={photo.src?.startsWith("data:")}
                    className="gallery__item-photo"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <a className="gallery__cta" href="#">
          Подписывайся в Instagram
          <ArrowUpRight />
        </a>
      </div>
    </section>
  );
}
