import { createRequire } from 'node:module';
import * as core from './core.js';

const require = createRequire(import.meta.url);
const data = require('../data/special-days.json');

export const specialDays = data;
export const { toMonthDay, isLeapYear, slotOf, formatLine } = core;

/** Is the Wordscapes Daily Puzzle of this date special? Defaults to today (local time). */
export function isTodaySpecial(date = new Date()) {
  return core.checkDate(data, date);
}

export const checkDate = (date) => core.checkDate(data, date);
export const isFlaggedDay = (date) => core.isFlaggedDay(data, core.toMonthDay(date));
export const nextSpecial = (date = new Date()) => core.nextSpecial(data, core.toMonthDay(date));
export const listSpecialDays = () => core.listSpecialDays(data);

export default isTodaySpecial;
