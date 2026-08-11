import Image from "next/image";
import { SendIcon } from "./Icons";
import Reveal from "./Reveal";

const BUBBLES = [
  {
    seed: "community-avatar-1",
    text: "Ищу +1 сегодня на 19:00",
    time: "18:42",
    style: { left: "52%", top: "14%" },
  },
  {
    seed: "community-avatar-2",
    text: "Кто сыграет завтра утром?",
    time: "09:12",
    style: { left: "6%", top: "50%" },
  },
  {
    seed: "community-avatar-3",
    text: "Нужна пара на Americano",
    time: "20:15",
    style: { left: "46%", top: "77%" },
  },
];

const STATS = [
  "100+ игроков",
  "Анонсы турниров",
  "Поиск напарников",
  "Общение",
  "Аликанте",
];

export default function Community() {
  return (
    <section className="community" id="community">
      <div className="community__inner">
        <div className="community__row">
          <div className="community__content">
            <Reveal>
              <p className="eyebrow">Сообщество</p>
              <h2 className="community__title">
                Ищешь
                <br />
                напарника?
                <br />
                <span className="section-title--muted">Найдём.</span>
              </h2>
            </Reveal>
            <Reveal as="p" className="community__paragraph" delay={150}>
              В Telegram каждый день ищут игроков,
              <br />
              собирают пары, договариваются
              <br />
              об играх и турнирах.
            </Reveal>
            <Reveal
              as="a"
              className="community__cta"
              href="https://t.me/+Hsd53uTBjWc4N2Rk"
              target="_blank"
              rel="noopener noreferrer"
              delay={280}
            >
              <SendIcon />
              Найти напарника в Telegram
            </Reveal>
          </div>

          <div className="community__photo">
            <Image
              src="https://picsum.photos/seed/community-photo/1200/900"
              alt=""
              fill
              sizes="900px"
              className="community__photo-img"
            />
            {BUBBLES.map((b) => (
              <div key={b.seed} className="community__bubble" style={b.style}>
                <span className="community__bubble-avatar">
                  <Image
                    src={`https://picsum.photos/seed/${b.seed}/80/80`}
                    alt=""
                    fill
                    sizes="36px"
                  />
                </span>
                <span className="community__bubble-text">{b.text}</span>
                <span className="community__bubble-time">{b.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="community__stats">
          {STATS.map((stat, i) => (
            <span key={stat} className="community__stat-item">
              {stat}
              {i < STATS.length - 1 && (
                <span className="community__stat-dot" aria-hidden="true" />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
