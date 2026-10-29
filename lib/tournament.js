// Логика турнирной сетки. Турнир — это набор категорий; в каждой от 4 до 16
// пар. Верхняя сетка рассчитана на 4, 8 или 16 мест (лишние места — «без
// соперника», пара проходит дальше автоматически), нижняя — для проигравших
// в первом круге. Чистые функции — используются и в админке, и на публичной странице.
export const SETS = 3;
export const MIN_TEAMS = 4;
export const MAX_TEAMS = 16;
export const BYE = -1; // пустое место в сетке

export const clampSize = (n) => Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, Math.round(n) || MAX_TEAMS));
export const bracketSize = (n) => (n <= 4 ? 4 : n <= 8 ? 8 : 16);

// Количество матчей в каждом раунде: 16 мест → up [8, 4, 2, 1], lo [4, 2, 1]
export function roundCounts(size) {
  const up = [];
  for (let m = bracketSize(size) / 2; m >= 1; m /= 2) up.push(m);
  return { up, lo: up.slice(1) };
}
export const counts = (cat) => roundCounts(cat.size);
const DEFAULT_NAMES = ["1ª Masculina", "2ª Masculina", "3ª Masculina", "4ª Masculina", "1ª Femenina", "2ª Femenina", "4ª Femenina"];
const DEFAULT_GROUPS = ["Мужская", "Мужская", "Мужская", "Мужская", "Женская", "Женская", "Женская"];
const DEFAULT_TIME = "20:00";
// Название раунда по числу матчей в нём
const ROUND_TITLES = {
  up: { 8: "1/8", 4: "1/4 · Четвертьфинал", 2: "1/2 · Полуфинал", 1: "Финал" },
  lo: { 4: "НС · 1/4", 2: "НС · 1/2", 1: "Финал НС" },
};
const ROUND_SHORT = {
  up: { 8: "1/8", 4: "1/4", 2: "1/2", 1: "Финал" },
  lo: { 4: "НС 1/4", 2: "НС 1/2", 1: "Финал НС" },
};
export const roundTitle = (br, n) => ROUND_TITLES[br][n];
const roundShort = (cat, br, r) => ROUND_SHORT[br][counts(cat)[br][r]];
export const firstRoundShort = (cat) => roundShort(cat, "up", 0);

export function toRoman(n) {
  const map = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

export const newMatch = () => ({ s: Array.from({ length: SETS }, () => ["", ""]) });
export const newRounds = (br, size) => roundCounts(size)[br].map((n) => Array.from({ length: n }, newMatch));
const newTimes = (size) => {
  const c = roundCounts(size);
  return { up: c.up.map(() => ""), lo: c.lo.map(() => "") };
};

// Меняет количество пар; результаты сбрасываются, время раундов — только если поменялась сетка
export function resizeCategory(cat, size) {
  const n = clampSize(size);
  if (bracketSize(n) !== bracketSize(cat.size)) cat.rt = newTimes(n);
  cat.size = n;
  cat.up = newRounds("up", n);
  cat.lo = newRounds("lo", n);
}

// Пустая категория. Первые 7 получают привычные названия и группы.
export function newCategory(i) {
  return {
    name: DEFAULT_NAMES[i] ?? `Категория ${i + 1}`,
    group: DEFAULT_GROUPS[i] ?? "",
    date: "",
    time: DEFAULT_TIME,
    size: MAX_TEAMS,
    rt: newTimes(MAX_TEAMS),
    teams: Array.from({ length: MAX_TEAMS }, () => ({ a: "", b: "" })),
    up: newRounds("up", MAX_TEAMS),
    lo: newRounds("lo", MAX_TEAMS),
  };
}

export const newCategories = () => DEFAULT_NAMES.map((_, i) => newCategory(i));

const str = (v) => (typeof v === "string" ? v : "");
const strOr = (v, fallback) => (typeof v === "string" ? v : fallback);

function normalizeMatch(raw) {
  const m = raw ?? {};
  const s = Array.from({ length: SETS }, (_, si) => {
    const set = Array.isArray(m.s) ? m.s[si] : undefined;
    return [str(set?.[0]).replace(/\D/g, "").slice(0, 2), str(set?.[1]).replace(/\D/g, "").slice(0, 2)];
  });
  return { s, wo: m.wo === 0 || m.wo === 1 ? m.wo : null, court: str(m.court).slice(0, 3) };
}

// Приводит данные из базы (или от клиента) к полной форме категории
export function normalizeCategory(raw, i) {
  const base = newCategory(i);
  if (!raw || typeof raw !== "object") return base;
  const c = raw;
  // Раньше количество пар было только текстом «12 пар · …» — берём число оттуда
  const size = clampSize(Number(c.size) || parseInt(str(c.upInfo), 10));
  const rc = roundCounts(size);
  const rounds = (br) =>
    rc[br].map((n, r) => Array.from({ length: n }, (_, k) => normalizeMatch(c[br]?.[r]?.[k])));
  return {
    name: strOr(c.name, base.name),
    group: strOr(c.group, base.group),
    date: str(c.date),
    time: str(c.time),
    size,
    rt: {
      up: rc.up.map((_, r) => str(c.rt?.up?.[r])),
      lo: rc.lo.map((_, r) => str(c.rt?.lo?.[r])),
    },
    teams: base.teams.map((_, t) => ({ a: str(c.teams?.[t]?.a), b: str(c.teams?.[t]?.b) })),
    up: rounds("up"),
    lo: rounds("lo"),
  };
}

// null/не массив — турнир ещё не заполнялся: даём 7 категорий по умолчанию
export function normalizeCategories(raw) {
  if (!Array.isArray(raw)) return newCategories();
  return raw.map((c, i) => normalizeCategory(c, i));
}

// Сводка для карточки турнира: сыграно матчей и чемпионы по категориям
export function tournamentSummary(categories) {
  return {
    played: categories.reduce((n, c) => n + playedCount(c), 0),
    total: categories.reduce((n, c) => n + matchCount(c), 0),
  };
}

/* ---------- сетка ---------- */
// Первый круг: пары по порядку, свободные места (BYE) разнесены по сетке
// равномерно, чтобы «автопроходы» не встречались друг с другом сразу.
function firstRound(size) {
  const m = bracketSize(size) / 2;
  const bits = Math.log2(m);
  const rev = (x) => parseInt(x.toString(2).padStart(bits, "0").split("").reverse().join(""), 2);
  const byes = new Set(Array.from({ length: bracketSize(size) - size }, (_, k) => rev(k)));
  let t = 0;
  return Array.from({ length: m }, (_, i) => (byes.has(i) ? [t++, BYE] : [t++, t++]));
}
// Индексы пар, стоящих в матче: BYE — пустое место, null — слот ещё не определён
export function participants(cat, br, r, i) {
  if (br === "up" && r === 0)
    return firstRound(cat.size)[i];
  if (br === "lo" && r === 0)
    return [loser(cat, "up", 0, 2 * i), loser(cat, "up", 0, 2 * i + 1)];
  return [winner(cat, br, r - 1, 2 * i), winner(cat, br, r - 1, 2 * i + 1)];
}
export const isBye = (p) => p.includes(BYE);
export function winner(cat, br, r, i) {
  const p = participants(cat, br, r, i);
  if (p[0] === BYE)
    return p[1];
  if (p[1] === BYE)
    return p[0];
  if (p[0] === null || p[1] === null)
    return null;
  const side = matchResult(cat[br][r][i]).w;
  return side === null ? null : p[side];
}
function loser(cat, br, r, i) {
  const p = participants(cat, br, r, i);
  if (isBye(p))
    return BYE;
  const w = winner(cat, br, r, i);
  if (w === null)
    return null;
  return p[0] === w ? p[1] : p[0];
}
// Сет выигрывает тот, у кого больше геймов (6:4, 7:6, супер-тай-брейк 10:8…),
// не засчитывается только ничья — при 6:6 играется тай-брейк и сет пишется 7:6.
export function setResult(x, y) {
  if (x === "" || y === "")
    return { win: null, error: null };
  const a = +x;
  const b = +y;
  if (a === b) {
    return { win: null, error: `${a}:${b} — ничья в сете не засчитывается. При 6:6 играется тай-брейк, впишите 7:6 победителю.` };
  }
  return { win: a > b ? 0 : 1, error: null };
}
export const isWalkover = (match) => match.wo === 0 || match.wo === 1;
// Кто выиграл матч (первым взял 2 сета) и ошибки по сетам
export function matchResult(match) {
  if (isWalkover(match))
    return { w: (1 - match.wo), errors: [] };
  const won = [0, 0];
  const errors = [];
  let w = null;
  match.s.forEach(([x, y], si) => {
    if (w !== null) {
      if (x !== "" || y !== "")
        errors.push({ si, text: "Матч уже решён в двух сетах — третий сет не нужен." });
      return;
    }
    const res = setResult(x, y);
    if (res.error)
      errors.push({ si, text: res.error });
    if (res.win !== null && ++won[res.win] === 2)
      w = res.win;
  });
  return { w, errors };
}
export function champion(cat, br) {
  const w = winner(cat, br, counts(cat)[br].length - 1, 0);
  return w === BYE ? null : w;
}
export function roundDone(cat, br, r) {
  return cat[br][r].every((_, i) => winner(cat, br, r, i) !== null);
}
// Настоящие матчи (без автопроходов): [сетка, раунд, номер]
function realMatches(cat, only) {
  const list = [];
  for (const br of only ? [only] : ["up", "lo"]) {
    cat[br].forEach((round, r) => round.forEach((_, i) => {
      if (!isBye(participants(cat, br, r, i)))
        list.push([br, r, i]);
    }));
  }
  return list;
}
export const matchCount = (cat, br) => realMatches(cat, br).length;
export function playedCount(cat) {
  return realMatches(cat).filter(([br, r, i]) => winner(cat, br, r, i) !== null).length;
}
// Сколько пар попадает в нижнюю сетку (проигравшие настоящих матчей первого круга)
export const loserCount = (cat) => cat.size - bracketSize(cat.size) / 2;
/* ---------- подписи ---------- */
export function teamNames(cat, t) {
  const { a, b } = cat.teams[t];
  if (!a && !b)
    return [`Пара ${t + 1}`, ""];
  return [a || "—", b || "—"];
}
export function initials(cat, t) {
  const { a, b } = cat.teams[t];
  const s = (a.trim()[0] || "") + (b.trim()[0] || "");
  return s ? s.toUpperCase() : String(t + 1);
}
export function sourceLabel(cat, br, r, i, k) {
  const n = 2 * i + k + 1;
  if (br === "lo" && r === 0)
    return `Проигравший ${firstRoundShort(cat)} #${n}`;
  return `Победитель ${roundShort(cat, br, r - 1)} #${n}`;
}
export function formatStart(cat) {
  if (!cat.date)
    return "—";
  const d = new Date(`${cat.date}T00:00`);
  const day = d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
  return `${day[0].toUpperCase()}${day.slice(1)} · ${cat.time || ""}`;
}
// Места проигравших в раунде из n матчей: с offset+n+1 по offset+2n (но не дальше числа пар)
function place(cat, offset, n) {
  const from = offset + n + 1;
  const to = Math.min(offset + 2 * n, cat.size);
  return { key: from, label: from >= to ? String(from) : `${from}–${to}` };
}
// Самый дальний матч пары в сетке: [раунд, номер] или null
function lastMatch(cat, br, t) {
  const rc = counts(cat)[br];
  for (let r = rc.length - 1; r >= 0; r--) {
    for (let i = 0; i < rc[r]; i++) {
      if (participants(cat, br, r, i).includes(t))
        return [r, i];
    }
  }
  return null;
}
export function teamStatus(cat, t) {
  const rc = counts(cat);
  const half = bracketSize(cat.size) / 2;
  const [ur, ui] = lastMatch(cat, "up", t);
  const uw = winner(cat, "up", ur, ui);
  if (uw === null)
    return { key: rc.up[ur] + 0.5, label: "—", text: `Играет ${roundShort(cat, "up", ur)}`, kind: "live" };
  if (uw === t)
    return { key: 1, label: "1", text: "Чемпион", kind: "gold" };
  if (ur > 0) {
    const text = rc.up[ur] === 1 ? "Финалист" : `Выбыли в ${roundShort(cat, "up", ur)}`;
    return { ...place(cat, 0, rc.up[ur]), text, kind: "out" };
  }
  const [lr, li] = lastMatch(cat, "lo", t);
  const lw = winner(cat, "lo", lr, li);
  if (lw === null)
    return { key: half + rc.lo[lr] + 0.5, label: "—", text: `Играет ${roundShort(cat, "lo", lr)}`, kind: "live" };
  if (lw === t)
    return { key: half + 1, label: String(half + 1), text: "Победитель НС", kind: "gold" };
  const text = rc.lo[lr] === 1 ? "Финалист НС" : `Выбыли в ${roundShort(cat, "lo", lr)}`;
  return { ...place(cat, half, rc.lo[lr]), text, kind: "out" };
}
// Матчи, сеты и геймы пары по обеим сеткам (учитываются только засчитанные сеты)
export function teamStats(cat, t) {
  const st = { w: 0, l: 0, sw: 0, sl: 0, gw: 0, gl: 0 };
  for (const br of ["up", "lo"]) {
    counts(cat)[br].forEach((n, r) => {
      for (let i = 0; i < n; i++) {
        const p = participants(cat, br, r, i);
        const k = p.indexOf(t);
        if (k === -1 || p.includes(null) || isBye(p))
          continue;
        const w = winner(cat, br, r, i);
        if (w === t)
          st.w++;
        else if (w !== null)
          st.l++;
        const match = cat[br][r][i];
        if (isWalkover(match))
          continue;
        match.s.forEach((set, si) => {
          const res = setResult(set[0], set[1]);
          if (res.win === null)
            return;
          if (res.win === k)
            st.sw++;
          else
            st.sl++;
          const superTb = si === 2 && Math.max(+set[0], +set[1]) >= 10;
          if (!superTb) {
            st.gw += +set[k];
            st.gl += +set[1 - k];
          }
        });
      }
    });
  }
  return st;
}
export function standings(cat) {
  const rows = cat.teams.slice(0, cat.size).map((_, t) => ({ t, ...teamStatus(cat, t), st: teamStats(cat, t) }));
  return rows.sort((a, b) => a.key - b.key
    || b.st.w - a.st.w
    || (b.st.sw - b.st.sl) - (a.st.sw - a.st.sl)
    || (b.st.gw - b.st.gl) - (a.st.gw - a.st.gl)
    || a.t - b.t);
}
/* ---------- ввод пар списком ---------- */
export const teamLine = ({ a, b }) => (a || b ? `${a} / ${b}`.trim() : "");
// «Имя1 / Имя2» (также через запятую, «;», « - » или таб) → { a, b }
export function parseTeams(text) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, MAX_TEAMS).map((line) => {
    const [a = "", ...rest] = line.split(/\s*[/,;\t]\s*|\s+-\s+/);
    return { a: a.trim(), b: rest.join(" ").trim() };
  });
}
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
