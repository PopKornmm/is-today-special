# is-today-special

**Is today's Wordscapes Daily Puzzle special?**

[![Today's Wordscapes daily](https://img.shields.io/endpoint?url=https%3A%2F%2Fpopkornmm.github.io%2Fis-today-special%2Fbadge.json)](https://popkornmm.github.io/is-today-special/)
[![npm](https://img.shields.io/npm/v/is-today-special)](https://www.npmjs.com/package/is-today-special)
[![tests](https://github.com/PopKornmm/is-today-special/actions/workflows/daily.yml/badge.svg)](https://github.com/PopKornmm/is-today-special/actions)

The Wordscapes Daily Puzzle runs on a **fixed 366-day calendar**: the same date brings back the same puzzle every year. Most days are ordinary. A few are not — a prank written backwards, a birthday week that breaks the game's own rack rules, a puzzle served once every four years, and 36 days a year that carry a mysterious internal flag.

This tiny program answers one question, for today or any date: **is it one of those days?**

👉 **Try it:** <https://popkornmm.github.io/is-today-special/>
👉 **Today's answer:** [Wordscapes Daily Puzzle Answers](https://www.solvingwordscapes.com/category/daily/)
👉 **Why these days are special:** [Inside the Wordscapes Daily Puzzles: The Secret Calendar](https://www.solvingwordscapes.com/wordscapes-daily-puzzles-study/)

## Quick start

```bash
npx is-today-special            # today
npx is-today-special 2026-06-23 # any date (YYYY-MM-DD or MM-DD)
npx is-today-special --list     # every special daily of the year
npx is-today-special --json     # machine-readable
```

```
$ npx is-today-special 06-23
June 23: SPECIAL — Birthday week, day 5: CROSSWORD
  • Birthday week (CROSSWORD): Nine letters, the longest word ever placed in a daily, on a 16x12 board.

Today's answer: https://www.solvingwordscapes.com/category/daily/
Why: https://www.solvingwordscapes.com/wordscapes-daily-puzzles-study/
```

The CLI exits with code `0` on a special day and `1` on a regular day, so it works in a shell `if`.

## As a library

```js
import { isTodaySpecial } from 'is-today-special';

const r = isTodaySpecial();            // today, local time
const b = isTodaySpecial('2028-02-29'); // the rarest daily in the game

r.special   // true | false
r.reasons   // [{ kind, label, title, summary, word?, pageUrl? }]
r.accidents // calendar accidents (fun, but they don't make the day special)
r.flagged   // one of the 36 flagged days?
r.next      // on a regular day: { date, label, title, inDays } of the next special daily
r.slot      // 1..366 position in the fixed calendar
```

Also exported: `isFlaggedDay(date)`, `nextSpecial(date)`, `listSpecialDays()`, `formatLine(result)`, and the raw dataset as `specialDays` (or `import data from 'is-today-special/data'`).

The core logic has no Node dependency: `import { checkDate } from 'is-today-special/core'` and pass the dataset yourself to run it in a browser, a worker or an extension.

## Why these days are special

Everything in [`data/special-days.json`](data/special-days.json) comes from the study [Inside the Wordscapes Daily Puzzles: The Secret Calendar](https://www.solvingwordscapes.com/wordscapes-daily-puzzles-study/), which mapped all 366 dailies from the game's own data. The short version:

| When | What | Why it's special |
| --- | --- | --- |
| April 1 | **JOKER** | The April Fools prank: every word is stored backwards. 5 letters, 6 words, the smallest board of the year. |
| June 10 | **PET ROCK** | Seven letters with no 7-letter word in them. The opener of the June 2024 birthday event, still served every year. |
| June 19–24 | **Birthday week** | BIRTHDAY, OBSERVE, WILDLIFE, FORTUNE, CROSSWORD, then a rack that spells WORD GAME. The only 8- and 9-letter racks in the game, and the biggest boards. |
| February 29 | **ASSAULT** | The rarest daily in Wordscapes. Next appearance: 2028. |
| December 26 | **MENORAH** | The only holiday-themed daily, pinned to a fixed date even though Hanukkah moves. |
| 14th, 15th, 19th of every month (June: 14, 19, 24) | **Flagged days** | 36 dailies carry an internal marker in the game data. Not harder — if anything slightly friendlier. What it means is still an open question. |
| January 15, February 15 | **Quietest dailies** | Only 8 words placed, the minimum of the calendar. |

The calendar also serves **SURVIVE** on Valentine's Day, **THROAT** on the Fourth of July, **COLONEL** on St. Patrick's Day, **RETIREE** on Veterans Day and **FINANCE** on National Crossword Puzzle Day. The program reports those too, as *calendar accidents*: fun, but not special.

## What is deliberately not in this repo

No letters, no grids, no word lists. This tool tells you *whether* a day is special and *why*; the puzzle itself is on the permanent page for that date at [solvingwordscapes.com/category/daily/](https://www.solvingwordscapes.com/category/daily/).

## The badge

`docs/badge.json` is a [shields.io endpoint](https://shields.io/badges/endpoint-badge) regenerated every day at 00:05 UTC by [the workflow](.github/workflows/daily.yml). Paste this anywhere Markdown is accepted:

```markdown
[![Today's Wordscapes daily](https://img.shields.io/endpoint?url=https%3A%2F%2Fpopkornmm.github.io%2Fis-today-special%2Fbadge.json)](https://popkornmm.github.io/is-today-special/)
```

## Development

```bash
npm test             # node --test
npm run build:docs   # regenerates docs/ (dataset module, today.json, badge.json)
```

The page under `docs/` is plain HTML + ES modules, no build tool, served by GitHub Pages (Settings → Pages → `main` / `docs`).

## Contributing

Spotted something the calendar does on a date the study missed? Open an issue with the date and what you saw — the 36-day flag in particular is an open question, and the [study](https://www.solvingwordscapes.com/wordscapes-daily-puzzles-study/) will be updated when it cracks.

## Credits

Built by [Pop](https://www.solvingwordscapes.com/author/pop/), the editor of [Solving Wordscapes](https://www.solvingwordscapes.com/). Community history of the 2024 daily events documented on r/wordscapes by u/OCCobblepot.

Wordscapes is a registered trademark of PeopleFun. This project is an independent fan tool, not affiliated with, sponsored by or operated by PeopleFun.

## License

MIT — see [LICENSE](LICENSE).
