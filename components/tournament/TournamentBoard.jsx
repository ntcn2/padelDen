"use client";

import { useRef, useState } from "react";
import {
  BYE,
  MAX_TEAMS,
  MIN_TEAMS,
  bracketSize,
  champion,
  clampSize,
  counts,
  firstRoundShort,
  formatStart,
  initials,
  isBye,
  isWalkover,
  loserCount,
  matchCount,
  matchResult,
  newCategory,
  newRounds,
  parseTeams,
  participants,
  playedCount,
  resizeCategory,
  roundDone,
  roundTitle,
  shuffle,
  sourceLabel,
  standings,
  teamLine,
  teamNames,
  toRoman,
  winner,
} from "@/lib/tournament";

const cx = (...parts) => parts.filter(Boolean).join(" ");
const digits = (v) => v.replace(/\D/g, "").slice(0, 2);

// 1 пара, 2 пары, 5 пар
function plural(n, [one, few, many]) {
  const d = n % 10;
  const dd = n % 100;
  const word = d === 1 && dd !== 11 ? one : d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
  return `${n} ${word}`;
}
const pairs = (n) => plural(n, ["пара", "пары", "пар"]);
const matches = (n) => plural(n, ["матч", "матча", "матчей"]);

/**
 * Категории турнира: карточки, а под ними — две сетки и таблица открытой
 * категории. `editable` включает поля ввода, добавление и удаление категорий
 * (админка); изменения отдаются наверх через onChange(новый массив категорий).
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
    onChange(cats.map((c, i) => (i === active ? next : c)));
  };

  function addCategory() {
    onChange([...cats, newCategory(cats.length)]);
    open(cats.length);
  }

  function removeCategory(ci) {
    if (!confirm(`Удалить категорию «${cats[ci].name}» вместе с парами и счетами?`)) return;
    onChange(cats.filter((_, i) => i !== ci));
    setActive(null);
  }

  return (
    <div className="tb">
      <div className="tb-cats">
        {cats.map((cat, ci) => (
          <CategoryCard
            key={ci}
            cat={cat}
            ci={ci}
            active={active === ci}
            onClick={() => open(ci)}
            onRemove={editable ? () => removeCategory(ci) : null}
          />
        ))}
        {editable ? (
          <button type="button" className="tb-cat tb-cat--add" onClick={addCategory}>
            <span className="tb-cat__plus">+</span>
            Добавить категорию
          </button>
        ) : null}
      </div>

      {!editable && cats.length === 0 ? <p className="tb-empty">Категории скоро появятся.</p> : null}

      <div ref={boardRef} className="tb-anchor">
        {active !== null ? (
          <Board key={active} cat={cats[active]} ci={active} editable={editable} edit={edit} onRemove={() => removeCategory(active)} />
        ) : null}
      </div>
    </div>
  );
}

/* ---------- карточка категории ---------- */

function CategoryCard({ cat, ci, active, onClick, onRemove }) {
  const champ = champion(cat, "up");
  return (
    <div className="tb-cat-wrap">
      <button type="button" onClick={onClick} className={cx("tb-cat", active && "tb-cat--active")}>
        <span className="tb-cat__top">
          <span className="tb-cat__num">{ci + 1}</span>
          <span className="tb-cat__arrow">{active ? "↓" : "↗"}</span>
        </span>

        <span className="tb-cat__meta">
          <span>{[toRoman(ci + 1), cat.group].filter(Boolean).join(" · ")}</span>
          <span className="tb-cat__dashes">
            {counts(cat).up.map((_, r) => (
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
            <span>{pairs(cat.size)} · {matches(matchCount(cat, "up"))}</span>
          </span>
          <span>
            <span>Нижняя сетка</span>
            <span>{pairs(loserCount(cat))} · {matches(matchCount(cat, "lo"))}</span>
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
                <small>/{matchCount(cat)}</small>
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
      {onRemove ? (
        <button type="button" className="tb-cat__del" title="Удалить категорию" aria-label="Удалить категорию" onClick={onRemove}>
          ✕
        </button>
      ) : null}
    </div>
  );
}

/* ---------- доска категории ---------- */

function Board({ cat, ci, editable, edit, onRemove }) {
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
          {editable ? (
            <>
              <label className="eyebrow tb-board__group">
                {toRoman(ci + 1)} ·
                <input
                  value={cat.group}
                  placeholder="группа, например Мужская"
                  onChange={(e) => edit((c) => { c.group = e.target.value; })}
                />
              </label>
              <input
                className="tb-board__title tb-board__title--input"
                value={cat.name}
                placeholder="Название категории"
                onChange={(e) => edit((c) => { c.name = e.target.value; })}
              />
            </>
          ) : (
            <>
              <p className="eyebrow">{[toRoman(ci + 1), cat.group].filter(Boolean).join(" · ")}</p>
              <h2 className="tb-board__title">{cat.name}</h2>
            </>
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
            {playedCount(cat)} / {matches(matchCount(cat))}
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
                    c.up = newRounds("up", c.size);
                    c.lo = newRounds("lo", c.size);
                  });
                }}
              >
                Сбросить результаты
              </button>
              <button
                type="button"
                className="tb-btn tb-btn--danger"
                onClick={() => {
                  if (!confirm("Очистить категорию: имена пар, счета, время и победителей? Название останется.")) return;
                  edit((c) => {
                    const size = c.size;
                    Object.assign(c, newCategory(ci), { name: c.name, group: c.group });
                    resizeCategory(c, size);
                  });
                }}
              >
                Очистить категорию
              </button>
              <button type="button" className="tb-btn tb-btn--danger" onClick={onRemove}>
                Удалить категорию
              </button>
            </>
          ) : null}
        </div>
      </div>

      {editable ? (
        <div className="tb-board__infos">
          <label className="tb-chip">
            Количество пар
            <select
              value={cat.size}
              onChange={(e) => {
                const n = +e.target.value;
                if (playedCount(cat) > 0 && !confirm("Изменение количества пар перестроит сетку и сбросит все счета. Имена останутся. Продолжить?")) return;
                edit((c) => resizeCategory(c, n));
              }}
            >
              {Array.from({ length: MAX_TEAMS - MIN_TEAMS + 1 }, (_, k) => MIN_TEAMS + k).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <span className="tb-chip">
            Верхняя сетка <b>{pairs(cat.size)} · {matches(matchCount(cat, "up"))}</b>
          </span>
          <span className="tb-chip">
            Нижняя сетка <b>{pairs(loserCount(cat))} · {matches(matchCount(cat, "lo"))}</b>
          </span>
        </div>
      ) : null}

      {editable && bulkOpen ? <BulkPanel cat={cat} edit={edit} onClose={() => setBulkOpen(false)} /> : null}

      <Bracket cat={cat} br="up" editable={editable} edit={edit} />
      {matchCount(cat, "lo") > 0 ? <Bracket cat={cat} br="lo" editable={editable} edit={edit} /> : null}
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
      c.teams = Array.from({ length: MAX_TEAMS }, (_, i) => list[i] || { a: "", b: "" });
      resizeCategory(c, clampSize(list.length));
    });
    onClose();
  }

  return (
    <div className="tb-panel tb-bulk">
      <p>Одна пара в строке, игроки через «/». От {MIN_TEAMS} до {MAX_TEAMS} строк — сколько строк, столько пар будет в сетке.</p>
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
            ? `${pairs(cat.size)}. Победитель матча проходит дальше, проигравший в ${firstRoundShort(cat)} попадает в нижнюю сетку.${
                cat.size < bracketSize(cat.size) ? " Пары без соперника проходят первый круг автоматически." : ""
              }`
            : `${pairs(loserCount(cat))}, проигравших в ${firstRoundShort(cat)}. Играют на выбывание так же, как в верхней сетке.`}
        </p>
        <div className="tb-nav">
          <button type="button" aria-label="Назад" onClick={() => scroll(-1)}>‹</button>
          <button type="button" aria-label="Вперёд" onClick={() => scroll(1)}>›</button>
        </div>
      </div>

      <div ref={scroller} className="tb-scroller">
        <div className="tb-grid">
          {counts(cat)[br].map((n, r) => (
            <div key={r} className="tb-round">
              <div className="tb-round__head">
                <span className="tb-round__title">{roundTitle(br, n)}</span>
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
  const bye = isBye(p);
  const ready = !bye && p[0] !== null && p[1] !== null;
  const errors = ready ? matchResult(match).errors : [];
  const badSets = new Set(errors.map((e) => e.si));
  const editMatch = (fn) => edit((c) => fn(c[br][r][i]));

  if (p[0] === BYE && p[1] === BYE) {
    return (
      <div className="tb-match tb-match--pending">
        <div className="tb-row">
          <span className="tb-row__names">
            <em>Матча нет</em>
          </span>
        </div>
      </div>
    );
  }

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

      {!bye && (editable || match.court) ? (
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
          bye={bye}
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

function TeamRow({ cat, br, r, i, k, t, match, w, ready, bye, badSets, editable, edit, editMatch }) {
  if (t === BYE) {
    return (
      <div className="tb-row">
        <span className="tb-ava tb-ava--unknown">—</span>
        <span className="tb-row__names">
          <em>Без соперника — проход дальше</em>
        </span>
      </div>
    );
  }

  if (t === null) {
    return (
      <div className="tb-row">
        <span className="tb-ava tb-ava--unknown">?</span>
        <span className="tb-row__names">
          <em>{sourceLabel(cat, br, r, i, k)}</em>
        </span>
        {bye ? null : (
          <>
            <span className="tb-row__scores">
              {match.s.map((_, si) => <span key={si} className="tb-score tb-score--ph" />)}
            </span>
            <span className="tb-pick-ph" />
          </>
        )}
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

      <span className="tb-row__scores" style={bye ? { display: "none" } : undefined}>
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
              className={cx("tb-score", set[k] === "" && "tb-score--empty", badSets.has(si) && "tb-score--bad")}
            />
          ) : (
            <span key={si} className={cx("tb-score", set[k] === "" && "tb-score--empty", badSets.has(si) && "tb-score--bad")}>
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
        <p>
          Места 1–{bracketSize(cat.size) / 2} разыгрываются в верхней сетке
          {loserCount(cat) > 0 ? `, ${bracketSize(cat.size) / 2 + 1}–${cat.size} — в нижней` : ""}. Обновляется по мере ввода счёта.
        </p>
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
