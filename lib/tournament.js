// Логика турнирной сетки: 7 категорий, в каждой верхняя сетка на 16 пар
// и нижняя сетка для 8 проигравших в 1/8. Чистые функции — используются
// и в админке, и на публичной странице.
export const CAT_COUNT = 7;
export const SETS = 3;
export const TEAM_COUNT = 16;
export const COUNTS = { up: [8, 4, 2, 1], lo: [4, 2, 1] };
export const TOTAL_MATCHES = [...COUNTS.up, ...COUNTS.lo].reduce((a, b) => a + b, 0);
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];
const CAT_NAMES = ["1ª Masculina", "2ª Masculina", "3ª Masculina", "4ª Masculina", "1ª Femenina", "2ª Femenina", "4ª Femenina"];
const CAT_DATES = ["2026-10-31", "2026-11-01", "2026-11-03", "2026-11-05", "2026-11-07", "2026-11-08", "2026-11-10"];
const CAT_TIME = "20:00";
export const CAT_GROUPS = ["Мужская", "Мужская", "Мужская", "Мужская", "Женская", "Женская", "Женская"];
export const ROUND_TITLES = {
    up: ["1/8", "1/4 · Четвертьфинал", "1/2 · Полуфинал", "Финал"],
    lo: ["НС · 1/4", "НС · 1/2", "Финал НС"],
};
export const ROUND_SHORT = {
    up: ["1/8", "1/4", "1/2", "Финал"],
    lo: ["НС 1/4", "НС 1/2", "Финал НС"],
};
export const newMatch = () => ({ s: Array.from({ length: SETS }, () => ["", ""]) });
export const newRounds = (br) => COUNTS[br].map((n) => Array.from({ length: n }, newMatch));
const newTimes = () => ({ up: COUNTS.up.map(() => ""), lo: COUNTS.lo.map(() => "") });
export function newCategory(i) {
    return {
        name: CAT_NAMES[i],
        date: CAT_DATES[i],
        time: CAT_TIME,
        rt: newTimes(),
        teams: Array.from({ length: TEAM_COUNT }, () => ({ a: "", b: "" })),
        up: newRounds("up"),
        lo: newRounds("lo"),
    };
}
const str = (v) => (typeof v === "string" ? v : "");
function normalizeMatch(raw) {
    const m = (raw ?? {});
    const s = Array.from({ length: SETS }, (_, si) => {
        const set = Array.isArray(m.s) ? m.s[si] : undefined;
        return [str(set?.[0]).replace(/\D/g, "").slice(0, 2), str(set?.[1]).replace(/\D/g, "").slice(0, 2)];
    });
    return { s, wo: m.wo === 0 || m.wo === 1 ? m.wo : null, court: str(m.court).slice(0, 3) };
}
// Приводит данные из базы (или от клиента) к полной форме категории
export function normalizeCategory(raw, i) {
    const base = newCategory(i);
    if (!raw || typeof raw !== "object")
        return base;
    const c = raw;
    const rounds = (br) => COUNTS[br].map((n, r) => Array.from({ length: n }, (_, k) => normalizeMatch(c[br]?.[r]?.[k])));
    return {
        name: str(c.name) || base.name,
        date: str(c.date),
        time: str(c.time),
        rt: {
            up: COUNTS.up.map((_, r) => str(c.rt?.up?.[r])),
            lo: COUNTS.lo.map((_, r) => str(c.rt?.lo?.[r])),
        },
        teams: base.teams.map((_, t) => ({ a: str(c.teams?.[t]?.a), b: str(c.teams?.[t]?.b) })),
        up: rounds("up"),
        lo: rounds("lo"),
    };
}
/* ---------- сетка ---------- */
// Индексы пар (0..15), стоящих в матче, или null, если слот ещё не определён
export function participants(cat, br, r, i) {
    if (br === "up" && r === 0)
        return [2 * i, 2 * i + 1];
    if (br === "lo" && r === 0)
        return [loser(cat, "up", 0, 2 * i), loser(cat, "up", 0, 2 * i + 1)];
    return [winner(cat, br, r - 1, 2 * i), winner(cat, br, r - 1, 2 * i + 1)];
}
export function winner(cat, br, r, i) {
    const p = participants(cat, br, r, i);
    if (p[0] === null || p[1] === null)
        return null;
    const side = matchResult(cat[br][r][i]).w;
    return side === null ? null : p[side];
}
function loser(cat, br, r, i) {
    const w = winner(cat, br, r, i);
    if (w === null)
        return null;
    const p = participants(cat, br, r, i);
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
    return winner(cat, br, COUNTS[br].length - 1, 0);
}
export function roundDone(cat, br, r) {
    return cat[br][r].every((_, i) => winner(cat, br, r, i) !== null);
}
export function playedCount(cat) {
    let n = 0;
    for (const br of ["up", "lo"]) {
        cat[br].forEach((round, r) => round.forEach((_, i) => { if (winner(cat, br, r, i) !== null)
            n++; }));
    }
    return n;
}
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
export function sourceLabel(br, r, i, k) {
    const n = 2 * i + k + 1;
    if (br === "lo" && r === 0)
        return `Проигравший 1/8 #${n}`;
    return `Победитель ${ROUND_SHORT[br][r - 1]} #${n}`;
}
export function formatStart(cat) {
    if (!cat.date)
        return "—";
    const d = new Date(`${cat.date}T00:00`);
    const day = d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
    return `${day[0].toUpperCase()}${day.slice(1)} · ${cat.time || ""}`;
}
const UP_PLACES = [null, { key: 5, label: "5–8", text: "Выбыли в 1/4" }, { key: 3, label: "3–4", text: "Выбыли в 1/2" }, { key: 2, label: "2", text: "Финалист" }];
const LO_PLACES = [{ key: 13, label: "13–16", text: "Выбыли в НС 1/4" }, { key: 11, label: "11–12", text: "Выбыли в НС 1/2" }, { key: 10, label: "10", text: "Финалист НС" }];
// Самый дальний матч пары в сетке: [раунд, номер] или null
function lastMatch(cat, br, t) {
    for (let r = COUNTS[br].length - 1; r >= 0; r--) {
        for (let i = 0; i < COUNTS[br][r]; i++) {
            if (participants(cat, br, r, i).includes(t))
                return [r, i];
        }
    }
    return null;
}
export function teamStatus(cat, t) {
    const [ur, ui] = lastMatch(cat, "up", t);
    const uw = winner(cat, "up", ur, ui);
    if (uw === null)
        return { key: [8.5, 4.5, 2.5, 1.5][ur], label: "—", text: `Играет ${ROUND_SHORT.up[ur]}`, kind: "live" };
    if (uw === t)
        return { key: 1, label: "1", text: "Чемпион", kind: "gold" };
    if (ur > 0)
        return { ...UP_PLACES[ur], kind: "out" };
    const [lr, li] = lastMatch(cat, "lo", t);
    const lw = winner(cat, "lo", lr, li);
    if (lw === null)
        return { key: [12.5, 10.5, 9.5][lr], label: "—", text: `Играет ${ROUND_SHORT.lo[lr]}`, kind: "live" };
    if (lw === t)
        return { key: 9, label: "9", text: "Победитель НС", kind: "gold" };
    return { ...LO_PLACES[lr], kind: "out" };
}
// Матчи, сеты и геймы пары по обеим сеткам (учитываются только засчитанные сеты)
export function teamStats(cat, t) {
    const st = { w: 0, l: 0, sw: 0, sl: 0, gw: 0, gl: 0 };
    for (const br of ["up", "lo"]) {
        COUNTS[br].forEach((n, r) => {
            for (let i = 0; i < n; i++) {
                const p = participants(cat, br, r, i);
                const k = p.indexOf(t);
                if (k === -1 || p.includes(null))
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
    const rows = cat.teams.map((_, t) => ({ t, ...teamStatus(cat, t), st: teamStats(cat, t) }));
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
    return text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, TEAM_COUNT).map((line) => {
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
