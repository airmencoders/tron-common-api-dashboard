import { startOfWeek, isBefore, isFuture, isEqual } from 'date-fns';

/**
 * Gets the first day of the week, given a date object
 * @param date the date to get the first day of the week form
 * @param firstDayOfWeek the starting day of the week. 0 = Sunday, 1 = Monday, ...
 * @returns Date the first date of the week
 */
export function getFirstDayOfWeek(date: number | Date, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6): Date {
  return startOfWeek(date, {
    weekStartsOn: firstDayOfWeek
  });
}

/**
 * Formats date to en-Ca (yyyy-MM-dd) in UTC timezone
 * @param date time since unix epoch in milliseconds or Date object
 * @returns {string} formatted date in yyyy-MM-dd
 */
export function formatDateToEnCa(date: number | Date): string {
  return new Date(date).toLocaleDateString('en-Ca');
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
export function isDateFuture(date: Date | number) {
  return isFuture(date);
}