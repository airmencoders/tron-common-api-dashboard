import { startOfWeek, isBefore, isFuture, isEqual, isThisISOWeek, addWeeks, endOfWeek, parseISO, startOfDay } from 'date-fns';
import format from 'date-fns/format';

/**
 * Gets the first day of the week, given a date object
 * @param date the date to get the first day of the week form
 * @param weekStartsOn the starting day of the week. 0 = Sunday, 1 = Monday, ...
 * @returns Date the first date of the week
 */
export function getFirstDayOfWeek(date: number | Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6): Date {
  return startOfWeek(date, {
    weekStartsOn: weekStartsOn
  });
}

/**
 * Formats date to en-Ca (yyyy-MM-dd) in UTC timezone
 * @param date time since unix epoch in milliseconds or Date object
 * @returns {string} formatted date in yyyy-MM-dd
 */
export function formatDateToEnCa(date: number | Date): string {
  return format(new Date(date),'yyyy-MM-dd');
}

/**
 * Checks if a date is before another date.
 *
 * @param firstDate the first date
 * @param secondDate the second date
 * @returns true if {@link firstDate} is before {@link secondDate}, false otherwise
 */
export function isDateBefore(firstDate: Date | number, secondDate: Date | number): boolean {
  return isBefore(firstDate, secondDate);
}

/**
 * Checks if two dates are equal
 *
 * @param firstDate first date
 * @param secondDate second date
 * @returns true if {@link firstDate} is equal to {@link secondDate}, false otherwise
 */
export function isDateEqual(firstDate: Date | number, secondDate: Date | number): boolean {
  return isEqual(firstDate, secondDate);
}

/**
 * Checks if a date is in the future
 *
 * @param date the date to check
 * @returns true if {@link date} is in the future
 */
export function isDateFuture(date: Date | number): boolean {
  return isFuture(date);
}

/**
 * Checks if a given date is within the current week
 * @param date date
 * @returns
 */
export function isDateInThisWeek(date: Date | number): boolean {
  return isThisISOWeek(date);
}

/**
 * Add an amount of weeks to a date
 * @param date date
 * @param weeksToAdd amount of weeks to add
 * @returns date with added weeks
 */
export function addWeeksToDate(date: Date | number, weeksToAdd: number): Date {
  return addWeeks(date, weeksToAdd);
}

/**
 * Gets the end of the week given a date
 * @param date date
 * @param weekStartsOn 0 = Sunday, 1 = Monday, ...
 * @returns
 */
export function getEndOfWeek(date: Date | number, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6): Date {
  return endOfWeek(date, { weekStartsOn });
}

/**
 * Parses an ISO date to Date
 * @param date iso date string
 * @returns
 */
export function parseIsoDate(date: string): Date {
  return parseISO(date);
}

/**
 * Gets the start of the day given a date
 * @param date date
 * @returns
 */
export function getStartOfDay(date: Date | number): Date {
  return startOfDay(date);
}
