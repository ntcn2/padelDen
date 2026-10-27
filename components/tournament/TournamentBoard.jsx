"use client";

import { useRef, useState } from "react";
import {
  CAT_GROUPS,
  COUNTS,
  ROMAN,
  ROUND_TITLES,
  TEAM_COUNT,
  TOTAL_MATCHES,
  champion,
  formatStart,
  initials,
  isWalkover,
  matchResult,
  newCategory,
  newRounds,
  parseTeams,
  participants,
  playedCount,
  roundDone,
  shuffle,
  sourceLabel,
  standings,
  teamLine,
  teamNames,
  winner,
} from "@/lib/tournament";

const cx = (...parts) => parts.filter(Boolean).join(" ");
const digits = (v) => v.replace(/\D/g, "").slice(0, 2);

/**
 * Турнир целиком: карточки категорий, а под ними — две сетки и таблица
 * открытой категории. `editable` включает поля ввода (админка); изменения
 * отдаются наверх через onChange(индекс категории, новая категория).
 */
export default function TournamentBoard({ cats, editable = false, onChange }) {
  const [active, setActive] = useState(null);
  const boardRef = useRef(null);

  function open(ci) {
    const next = active === ci ? null : ci;
    setActive(next);
    if (next !== null) {
      requestAnimationFrame(() =>
        boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }

  const edit = (fn) => {
    if (active === null || !onChange) return;
    const next = structuredClone(cats[active]);
    fn(next);
    onChange(active, next);
  };

  return (
    <div className="tb">
      <div className="tb-cats">
        {cats.map((cat, ci) => (
          <CategoryCard key={ci} cat={cat} ci={ci} active={active === ci} onClick={() => open(ci)} />
        ))}
      </div>

      <div ref={boardRef} className="tb-anchor">
        {active !== null ? (
          <Board key={active} cat={cats[active]} ci={active} editable={editable} edit={edit} />
        ) : null}
      </div>
    </div>
  );
}

/* ---------- карточка категории ---------- */

function CategoryCard({ cat, ci, active, onClick }) {
  const champ = champion(cat, "up");
  return (
    <button type="button" onClick={onClick} className={cx("tb-cat", active && "tb-cat--active")}>
      <span className="tb-cat__top">
        <span className="tb-cat__num">{ci + 1}</span>
        <span className="tb-cat__arrow">{active ? "↓" : "↗"}</span>
      </span>

      <span className="tb-cat__meta">
        <span>{ROMAN[ci]} · {CAT_GROUPS[ci]}</span>
        <span className="tb-cat__dashes">
          {COUNTS.up.map((_, r) => (
            <i key={r} className={roundDone(cat, "up", r) ? "is-on" : ""} />
          ))}
        </span>
      </span>

      <span className="tb-cat__name">{cat.name}</span>

      <span className="tb-cat__rows">
        <span>
          <span>Старт</span>
          <b>{formatStart(cat)}</b>
        </span>
        <span>
          <span>Верхняя сетка</span>
          <span>16 пар · 15 матчей</span>
        </span>
        <span>
          <span>Нижняя сетка</span>
          <span>8 пар · 7 матчей</span>
        </span>
      </span>

      <span className="tb-cat__bottom">
        {champ !== null ? (
          <>
            <span className="tb-cat__big tb-cat__big--champ">🏆</span>
            <span className="tb-cat__sub">
              <b>{teamNames(cat, champ).filter(Boolean).join(" / ")}</b>
              <br />
              чемпион
            </span>
          </>
        ) : (
          <>
            <span className="tb-cat__big">
              {playedCount(cat)}
              <small>/{TOTAL_MATCHES}</small>
            </span>
            <span className="tb-cat__sub">
              матчей
              <br />
              сыграно
            </span>
          </>
        )}
      </span>
    </button>
  );
}

/* ---------- доска категории ---------- */

function Board({ cat, ci, editable, edit }) {
  const [bulkOpen, setBulkOpen] = useState(false);

  // Enter в поле счёта или имени: перейти к следующему полю
  function onKeyDown(e) {
    if (e.key !== "Enter" || !e.target.matches("input[data-nav]")) return;
    const inputs = [...e.currentTarget.querySelectorAll("input[data-nav]")];
    const next = inputs[inputs.indexOf(e.target) + 1];
    if (next) {
      next.focus();
      next.select();
    }
  }

  return (
    <div className="tb-board" onKeyDown={onKeyDown}>
      <div className="tb-board__head">
        <div className="tb-board__title-wrap">
          <p className="eyebrow">{ROMAN[ci]} · {CAT_GROUPS[ci]}</p>
          {editable ? (
            <input
              className="tb-board__title tb-board__title--input"
              value={cat.name}
              onChange={(e) => edit((c) => { c.name = e.target.value; })}
            />
          ) : (
            <h2 className="tb-board__title">{cat.name}</h2>
          )}
        </div>

        <div className="tb-board__actions">
          {editable ? (
            <label className="tb-chip">
              Старт
              <input type="date" value={cat.date} onChange={(e) => edit((c) => { c.date = e.target.value; })} />
              <input type="time" value={cat.time} onChange={(e) => edit((c) => { c.time = e.target.value; })} />
            </label>
          ) : (
            <span className="tb-chip">
              Старт <b>{formatStart(cat)}</b>
            </span>
          )}
          <span className="tb-chip tb-chip--accent">
            {playedCount(cat)} / {TOTAL_MATCHES} матчей
          </span>
          {editable ? (
            <>
              <button type="button" className={cx("tb-btn", bulkOpen && "tb-btn--on")} onClick={() => setBulkOpen((v) => !v)}>
                Внести пары списком
              </button>
              <button
                type="button"
                className="tb-btn"
                onClick={() => {
                  if (!confirm("Сбросить все счета и победителей в этой категории? Имена останутся.")) return;
                  edit((c) => {
                    c.up = newRounds("up");
                    c.lo = newRounds("lo");
                  });
                }}
              >
                Сбросить результаты
              </button>
              <button
                type="button"
                className="tb-btn tb-btn--danger"
                onClick={() => {
                  if (!confirm("Полностью очистить категорию: имена, счета и победителей?")) return;
                  edit((c) => { Object.assign(c, newCategory(ci)); });
                }}
              >
                Очистить категорию
              </button>
            </>
          ) : null}
        </div>
      </div>

      {editable && bulkOpen ? <BulkPanel cat={cat} edit={edit} onClose={() => setBulkOpen(false)} /> : null}

      <Bracket cat={cat} br="up" editable={editable} edit={edit} />
      <Bracket cat={cat} br="lo" editable={editable} edit={edit} />
      <Results cat={cat} />
    </div>
  );
}

/* ---------- ввод пар списком ---------- */

function BulkPanel({ cat, edit, onClose }) {
  const [text, setText] = useState(() => cat.teams.map(teamLine).filter(Boolean).join("\n"));

  function apply(random) {
    let list = parseTeams(text);
    if (!list.length) return;
    if (playedCount(cat) > 0 && !confirm("В категории уже есть счета. Расстановка пар сбросит все результаты. Продолжить?")) return;
    if (random) list = shuffle(list);
    edit((c) => {
      c.teams = Array.from({ length: TEAM_COUNT }, (_, i) => list[i] || { a: "", b: "" });
      c.up = newRounds("up");
      c.lo = newRounds("lo");
    });
    onClose();
  }

  return (
    <div className="tb-panel tb-bulk">
      <p>Одна пара в строке, игроки через «/». До 16 строк.</p>
      <textarea
        autoFocus
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Макс / Никита\nОлег / Игорь\nЖеня / Вася\n…"}
      />
      <div className="tb-bulk__actions">
        <button type="button" className="tb-btn tb-btn--accent" onClick={() => apply(false)}>
          Расставить по порядку
        </button>
        <button type="button" className="tb-btn tb-btn--dark" onClick={() => apply(true)}>
          🎲 Жеребьёвка (случайно)
        </button>
        <button type="button" className="tb-btn" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

/* ---------- сетка ---------- */

function Bracket({ cat, br, editable, edit }) {
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current?.scrollBy({ left: dir * 380, behavior: "smooth" });

  return (
    <section className="tb-panel tb-bracket">
      <div className="tb-panel__head">
        <h3>{br === "up" ? "Верхняя сетка" : "Нижняя сетка"}</h3>
        <p>
          {br === "up"
            ? "16 пар. Победитель матча проходит дальше, проигравший в 1/8 попадает в нижнюю сетку."
            : "8 пар, проигравших в 1/8. Играют на выбывание так же, как в верхней сетке."}
        </p>
        <div className="tb-nav">
          <button type="button" aria-label="Назад" onClick={() => scroll(-1)}>‹</button>
          <button type="button" aria-label="Вперёд" onClick={() => scroll(1)}>›</button>
        </div>
      </div>

      <div ref={scroller} className="tb-scroller">
        <div className="tb-grid">
          {COUNTS[br].map((n, r) => (
            <div key={r} className="tb-round">
              <div className="tb-round__head">
                <span className="tb-round__title">{ROUND_TITLES[br][r]}</span>
                {editable ? (
                  <label className="tb-chip tb-chip--sm">
                    Время
                    <input type="time" value={cat.rt[br][r]} onChange={(e) => edit((c) => { c.rt[br][r] = e.target.value; })} />
                  </label>
                ) : cat.rt[br][r] ? (
                  <span className="tb-round__time">
                    Начало <b>{cat.rt[br][r]}</b>
                  </span>
                ) : null}
              </div>
              <div className="tb-round__body">
                {Array.from({ length: Math.ceil(n / 2) }, (_, p) => (
                  <div key={p} className={cx("tb-pair", n === 1 && "tb-pair--single")}>
                    {[2 * p, 2 * p + 1].filter((x) => x < n).map((i) => (
                      <div key={i} className="tb-slot">
                        <MatchCard cat={cat} br={br} r={r} i={i} editable={editable} edit={edit} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="tb-round tb-round--final">
            <div className="tb-round__head">
              <span className="tb-round__title">Итог</span>
            </div>
            <div className="tb-round__body">
              <div className="tb-pair tb-pair--single">
                <div className="tb-slot">
                  <ChampionCard cat={cat} br={br} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Avatar({ cat, t }) {
  return (
    <span className="tb-ava">
      {initials(cat, t)}
      <i>{t + 1}</i>
    </span>
  );
}

function MatchCard({ cat, br, r, i, editable, edit }) {
  const match = cat[br][r][i];
  const p = participants(cat, br, r, i);
  const w = winner(cat, br, r, i);
  const ready = p[0] !== null && p[1] !== null;
  const errors = ready ? matchResult(match).errors : [];
  const badSets = new Set(errors.map((e) => e.si));
  const editMatch = (fn) => edit((c) => fn(c[br][r][i]));

  return (
    <div
      className={cx(
        "tb-match",
        !ready && "tb-match--pending",
        w !== null && "tb-match--done",
        errors.length > 0 && "tb-match--error"
      )}
    >
      <span className="tb-match__num">#{i + 1}</span>

      {editable || match.court ? (
        <div className="tb-match__meta">
          <label className="tb-chip tb-chip--xs">
            Корт
            {editable ? (
              <input
                className="tb-court"
                inputMode="numeric"
                maxLength={3}
                placeholder="—"
                value={match.court ?? ""}
                onChange={(e) => editMatch((m) => { m.court = e.target.value; })}
              />
            ) : (
              <b>{match.court}</b>
            )}
          </label>
        </div>
      ) : null}

      {p.map((t, k) => (
        <TeamRow
          key={k}
          cat={cat}
          br={br}
          r={r}
          i={i}
          k={k}
          t={t}
          match={match}
          w={w}
          ready={ready}
          badSets={badSets}
          editable={editable}
          edit={edit}
          editMatch={editMatch}
        />
      ))}

      {errors.length ? (
        <div className="tb-match__note">
          {errors.map((e) => (
            <span key={e.si}>
              <b>Сет {e.si + 1}:</b> {e.text}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TeamRow({ cat, br, r, i, k, t, match, w, ready, badSets, editable, edit, editMatch }) {
  if (t === null) {
    return (
      <div className="tb-row">
        <span className="tb-ava tb-ava--unknown">?</span>
        <span className="tb-row__names">
          <em>{sourceLabel(br, r, i, k)}</em>
        </span>
        <span className="tb-row__scores">
          {match.s.map((_, si) => <span key={si} className="tb-score tb-score--ph" />)}
        </span>
        <span className="tb-pick-ph" />
      </div>
    );
  }

  const nameEditable = editable && br === "up" && r === 0;
  const noShow = match.wo === k;
  const scoreOff = !ready || isWalkover(match);
  const state = w === null ? "" : w === t ? "win" : "lose";

  return (
    <div className={cx("tb-row", state && `tb-row--${state}`, noShow && "tb-row--no-show")}>
      <Avatar cat={cat} t={t} />

      <span className="tb-row__names">
        {nameEditable
          ? ["a", "b"].map((f) => (
              <input
                key={f}
                data-nav
                className="tb-name"
                value={cat.teams[t][f]}
                placeholder="+ имя игрока"
                onChange={(e) => edit((c) => { c.teams[t][f] = e.target.value; })}
              />
            ))
          : teamNames(cat, t).map((n, j) => <span key={j}>{n}</span>)}
        {noShow ? <em className="tb-row__wo">неявка</em> : null}
      </span>

      <span className="tb-row__scores">
        {match.s.map((set, si) =>
          editable ? (
            <input
              key={si}
              data-nav
              inputMode="numeric"
              maxLength={2}
              disabled={scoreOff}
              value={set[k]}
              onChange={(e) => editMatch((m) => { m.s[si][k] = digits(e.target.value); })}
              className={cx("tb-score", badSets.has(si) && "tb-score--bad")}
            />
          ) : (
            <span key={si} className={cx("tb-score", badSets.has(si) && "tb-score--bad")}>
              {set[k]}
            </span>
          )
        )}
      </span>

      {w === t ? (
        <span className="tb-pick tb-pick--on">✓</span>
      ) : editable ? (
        <button
          type="button"
          disabled={!ready}
          title={noShow ? "Отменить неявку" : "Неявка: пара не пришла, победа сопернику"}
          onClick={() => editMatch((m) => { m.wo = m.wo === k ? null : k; })}
          className={cx("tb-pick tb-wo", noShow && "tb-wo--on")}
        >
          н/я
        </button>
      ) : (
        <span className="tb-pick-ph" />
      )}
    </div>
  );
}

function ChampionCard({ cat, br }) {
  const t = champion(cat, br);
  return (
    <div className={cx("tb-champ", t !== null && "tb-champ--done")}>
      <span className="tb-champ__title">🏆 {br === "up" ? "Чемпион" : "Победитель НС"}</span>
      <div className="tb-row">
        {t === null ? (
          <>
            <span className="tb-ava tb-ava--unknown">?</span>
            <span className="tb-row__names">
              <em>Определится в финале</em>
            </span>
          </>
        ) : (
          <>
            <Avatar cat={cat} t={t} />
            <span className="tb-row__names tb-champ__names">
              {teamNames(cat, t).map((n, j) => <span key={j}>{n}</span>)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- таблица результатов ---------- */

const signed = (n) => (n > 0 ? `+${n}` : String(n));
const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

function Results({ cat }) {
  const rows = standings(cat);
  return (
    <section className="tb-panel tb-results">
      <div className="tb-panel__head">
        <h3>Таблица результатов</h3>
        <p>Места 1–8 разыгрываются в верхней сетке, 9–16 — в нижней. Обновляется по мере ввода счёта.</p>
      </div>
      <div className="tb-table-wrap">
        <table className="tb-table">
          <thead>
            <tr>
              <th>Место</th>
              <th>Пара</th>
              <th>Статус</th>
              <th className="tb-num">Матчи В–П</th>
              <th className="tb-num">Сеты</th>
              <th className="tb-num">Геймы</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ t, st, ...row }) => (
              <tr key={t} className={row.key <= 3 ? "is-top" : ""}>
                <td className="tb-place">
                  {row.label === "—" ? <span className="tb-place--dash">—</span> : `${MEDAL[row.key] ?? ""} ${row.label}`}
                </td>
                <td>
                  <div className="tb-pair-cell">
                    <Avatar cat={cat} t={t} />
                    <span className="tb-row__names">
                      {teamNames(cat, t).filter(Boolean).map((n, j) => <span key={j}>{n}</span>)}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`tb-status tb-status--${row.kind}`}>{row.text}</span>
                </td>
                <td className="tb-num">{st.w}–{st.l}</td>
                <td className="tb-num">
                  {st.sw}–{st.sl}
                  <span className="tb-diff">{signed(st.sw - st.sl)}</span>
                </td>
                <td className="tb-num">
                  {st.gw}–{st.gl}
                  <span className="tb-diff">{signed(st.gw - st.gl)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
