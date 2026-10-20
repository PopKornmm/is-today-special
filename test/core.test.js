import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTodaySpecial, isFlaggedDay, listSpecialDays, nextSpecial, slotOf, formatLine } from '../src/index.js';

test('April 1 is the backwards prank', () => {
  const r = isTodaySpecial('04-01');
  assert.equal(r.special, true);
  assert.equal(r.reasons[0].kind, 'prank');
  assert.equal(r.reasons[0].word, 'JOKER');
});

test('birthday week is June 19 to 24, all special', () => {
  const words = ['BIRTHDAY', 'OBSERVE', 'WILDLIFE', 'FORTUNE', 'CROSSWORD', 'WORD GAME'];
  for (let i = 0; i < 6; i += 1) {
    const r = isTodaySpecial(`06-${19 + i}`);
    assert.equal(r.special, true, `June ${19 + i}`);
    assert.equal(r.reasons.find((x) => x.kind === 'birthday').word, words[i]);
  }
});

test('flagged days: 14, 15, 19 every month; June 14, 19, 24', () => {
  for (let m = 1; m <= 12; m += 1) {
    const days = m === 6 ? [14, 19, 24] : [14, 15, 19];
    for (const d of days) assert.equal(isFlaggedDay({ month: m, day: d }), true, `${m}-${d}`);
    assert.equal(isFlaggedDay({ month: m, day: 3 }), false);
  }
  assert.equal(isFlaggedDay('06-15'), false);
});

test('there are exactly 36 flagged days', () => {
  const flagged = listSpecialDays().filter((r) => r.flagged);
  assert.equal(flagged.length, 36);
});

test('Feb 29 is the rarest daily', () => {
  const r = isTodaySpecial('2028-02-29');
  assert.equal(r.reasons[0].kind, 'rarest');
  assert.equal(r.reasons[0].word, 'ASSAULT');
  assert.equal(r.slot, 60);
});

test('a plain day is regular and points to the next special daily', () => {
  const r = isTodaySpecial('2026-10-20');
  assert.equal(r.special, false);
  assert.equal(r.reasons.length, 0);
  assert.equal(r.next.date, '11-14');
  assert.equal(r.next.inDays, 25);
  assert.match(formatLine(r), /regular/);
});

test('calendar accidents are reported but do not make a day special', () => {
  const r = isTodaySpecial('07-04');
  assert.equal(r.special, false);
  assert.equal(r.accidents[0].word, 'THROAT');
});

test('Veterans Day: flagged? no. accident: RETIREE', () => {
  const r = isTodaySpecial('11-11');
  assert.equal(r.special, false);
  assert.equal(r.accidents[0].word, 'RETIREE');
});

test('nextSpecial wraps past December 31', () => {
  const n = nextSpecial('2026-12-27');
  assert.equal(n.date, '01-14');
  assert.equal(n.inDays, 18);
});

test('nextSpecial skips Feb 29 in non-leap years and keeps it in leap years', () => {
  assert.equal(nextSpecial('2027-02-20').date, '03-14');
  assert.equal(nextSpecial('2028-02-20').date, '02-29');
});

test('slot numbers: Jan 1 = 1, Dec 31 = 366', () => {
  assert.equal(slotOf({ month: 1, day: 1 }), 1);
  assert.equal(slotOf({ month: 12, day: 31 }), 366);
});

test('invalid dates throw', () => {
  assert.throws(() => isTodaySpecial('13-01'), RangeError);
  assert.throws(() => isTodaySpecial('02-30'), RangeError);
  assert.throws(() => isTodaySpecial('hello'), TypeError);
});
