/**
 * is-today-special — core logic.
 *
 * Answers one question: is the Wordscapes Daily Puzzle of a given date special?
 * Everything here is derived from the Solving Wordscapes daily puzzles study:
 * https://www.solvingwordscapes.com/wordscapes-daily-puzzles-study/
 *
 * This module is environment-agnostic (no Node APIs) so the same code runs in
 * the CLI, in Node and in the browser page under docs/.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Normalise anything date-like into { month, day, year|null, key: 'MM-DD' }.
 * Accepts a Date, 'YYYY-MM-DD', 'MM-DD', or { month, day }.
 */
export function toMonthDay(input) {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new TypeError('Invalid Date');
    return { month: input.getMonth() + 1, day: input.getDate(), year: input.getFullYear() };
  }
  if (typeof input === 'string') {
    const m = input.trim().match(/^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})$/);
    if (!m) throw new TypeError(`Unrecognised date "${input}" (use YYYY-MM-DD or MM-DD)`);
    const year = m[1] ? Number(m[1]) : null;
    const month = Number(m[2]);
    const day = Number(m[3]);
    validateMonthDay(month, day);
    return { month, day, year };
  }
  if (input && typeof input === 'object' && 'month' in input && 'day' in input) {
    const month = Number(input.month);
    const day = Number(input.day);
    validateMonthDay(month, day);
    return { month, day, year: input.year == null ? null : Number(input.year) };
  }
  throw new TypeError('Expected a Date, a "YYYY-MM-DD" / "MM-DD" string, or { month, day }');
}

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function validateMonthDay(month, day) {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`Invalid month ${month}`);
  if (!Number.isInteger(day) || day < 1 || day > DAYS_IN_MONTH[month - 1]) {
    throw new RangeError(`Invalid day ${day} for month ${month}`);
  }
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** True when the date is one of the 36 flagged dailies. */
export function isFlaggedDay(data, md) {
  const { month, day } = md;
  const override = data.flaggedDays.overrides[String(month)];
  const days = override || data.flaggedDays.defaultDays;
  return days.includes(day);
}

/** Slot number 1..366 of the date in the fixed daily calendar (Feb 29 = 60). */
export function slotOf(md) {
  let n = 0;
  for (let m = 1; m < md.month; m += 1) n += DAYS_IN_MONTH[m - 1];
  return n + md.day;
}

/**
 * Main entry point.
 * @returns {{
 *   date: string, label: string, special: boolean, slot: number,
 *   reasons: Array<{kind:string,label:string,title:string,summary:string,word?:string,pageUrl?:string}>,
 *   accidents: Array<...>, flagged: boolean, next: {date:string,title:string,inDays:number}|null,
 *   todaysAnswerUrl: string, sourceUrl: string
 * }}
 */
export function checkDate(data, input = new Date(), { withNext = true } = {}) {
  const md = toMonthDay(input);
  const key = `${pad2(md.month)}-${pad2(md.day)}`;
  const label = `${MONTH_NAMES[md.month - 1]} ${md.day}`;

  const entries = data.specialDays.filter((d) => d.date === key);
  const reasons = [];
  const accidents = [];

  for (const e of entries) {
    const kind = data.kinds[e.kind] || { label: e.kind, special: true };
    const item = { kind: e.kind, label: kind.label, title: e.title, summary: e.summary };
    if (e.word) item.word = e.word;
    if (e.pageUrl) item.pageUrl = e.pageUrl;
    (kind.special ? reasons : accidents).push(item);
  }

  const flagged = isFlaggedDay(data, md);
  if (flagged) {
    reasons.push({
      kind: 'flagged',
      label: data.kinds.flagged.label,
      title: 'One of the 36 flagged dailies',
      summary: data.flaggedDays.description,
    });
  }

  const special = reasons.length > 0;
  const next = special || !withNext ? null : nextSpecial(data, md);

  return {
    date: key,
    label,
    special,
    slot: slotOf(md),
    reasons,
    accidents,
    flagged,
    next,
    todaysAnswerUrl: data.todaysAnswerUrl,
    sourceUrl: data.source.url,
  };
}

/**
 * Nearest upcoming special daily after the given date (wrapping past Dec 31).
 * Flagged days count as special. Feb 29 counts only when the next Feb 29 is real,
 * i.e. the year is known and leap; without a year it is skipped.
 */
export function nextSpecial(data, md) {
  const year = md.year;
  let cursor = { month: md.month, day: md.day };
  for (let steps = 1; steps <= 366; steps += 1) {
    cursor = advance(cursor);
    if (cursor.month === 2 && cursor.day === 29) {
      const y = year == null ? null : (cursor.month < md.month || (cursor.month === md.month && cursor.day <= md.day) ? year + 1 : year);
      if (y == null || !isLeapYear(y)) continue;
    }
    const r = checkDate(data, { ...cursor, year }, { withNext: false });
    if (r.special) {
      const first = r.reasons[0];
      return { date: r.date, label: r.label, title: first.title, inDays: daysBetween(md, cursor, year) };
    }
  }
  return null;
}

function advance({ month, day }) {
  if (day < DAYS_IN_MONTH[month - 1]) return { month, day: day + 1 };
  return { month: month === 12 ? 1 : month + 1, day: 1 };
}

function daysBetween(from, to, year) {
  // Count real calendar days; Feb 29 only exists in leap years.
  if (year == null) year = 2025; // non-leap reference when year is unknown
  const a = new Date(Date.UTC(year, from.month - 1, from.day));
  let b = new Date(Date.UTC(year, to.month - 1, to.day));
  if (b <= a) b = new Date(Date.UTC(year + 1, to.month - 1, to.day));
  return Math.round((b - a) / 86400000);
}

/** All special dates of the calendar, in order, for listing purposes. */
export function listSpecialDays(data) {
  const out = [];
  for (let month = 1; month <= 12; month += 1) {
    for (let day = 1; day <= DAYS_IN_MONTH[month - 1]; day += 1) {
      const r = checkDate(data, { month, day }, { withNext: false });
      if (r.special) out.push(r);
    }
  }
  return out;
}

/** One-line human sentence, used by the CLI and the badge. */
export function formatLine(result) {
  if (!result.special) {
    const nxt = result.next ? ` Next special daily: ${result.next.label} (${result.next.title}), in ${result.next.inDays} day${result.next.inDays === 1 ? '' : 's'}.` : '';
    return `${result.label}: a regular Wordscapes daily.${nxt}`;
  }
  const why = result.reasons.map((r) => r.title).join(' · ');
  return `${result.label}: SPECIAL — ${why}`;
}
