#!/usr/bin/env node
import { isTodaySpecial, listSpecialDays, formatLine, specialDays } from '../src/index.js';

const args = process.argv.slice(2);

function usage() {
  console.log(`is-today-special — is the Wordscapes Daily Puzzle special today?

Usage:
  is-today-special                 check today
  is-today-special 2026-06-23      check a date (YYYY-MM-DD or MM-DD)
  is-today-special --list          list every special daily of the year
  is-today-special --json [date]   machine-readable output

Today's answer:  ${specialDays.todaysAnswerUrl}
Source study:    ${specialDays.source.url}`);
}

if (args.includes('-h') || args.includes('--help')) {
  usage();
  process.exit(0);
}

const json = args.includes('--json');
const list = args.includes('--list');
const dateArg = args.find((a) => !a.startsWith('--'));

try {
  if (list) {
    const rows = listSpecialDays();
    if (json) {
      console.log(JSON.stringify(rows, null, 2));
    } else {
      for (const r of rows) console.log(formatLine(r));
      console.log(`\n${rows.length} special dailies a year (incl. the 36 flagged days).`);
      console.log(`Source: ${specialDays.source.url}`);
    }
    process.exit(0);
  }

  const result = isTodaySpecial(dateArg ? dateArg : new Date());
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  console.log(formatLine(result));
  for (const r of result.reasons) {
    console.log(`  • ${r.label}${r.word ? ` (${r.word})` : ''}: ${r.summary}`);
  }
  for (const a of result.accidents) {
    console.log(`  · ${a.label}${a.word ? ` (${a.word})` : ''}: ${a.summary}`);
  }
  console.log(`\nToday's answer: ${result.todaysAnswerUrl}`);
  console.log(`Why: ${result.sourceUrl}`);
  process.exit(result.special ? 0 : 1);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(2);
}
