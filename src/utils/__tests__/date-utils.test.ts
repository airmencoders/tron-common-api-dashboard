import { addWeeksToDate, formatDateToEnCa, getEndOfWeek, getFirstDayOfWeek, getStartOfDay, isDateBefore, isDateEqual, isDateFuture, isDateInThisWeek, parseIsoDate } from '../date-utils';

describe('Date util tests', () => {
  it('should get the first day of the week', () => {
    const date = new Date(2021, 6, 23);
    const firstDayOfWeek = getFirstDayOfWeek(date, 1);
    const expected = new Date(2021, 6, 19);
    expect(formatDateToEnCa(firstDayOfWeek)).toBe(formatDateToEnCa(expected));
  });

  it('should format date to yyyy-MM-dd', () => {
    const date = new Date(1627046349079);
    expect(formatDateToEnCa(date)).toBe('2021-07-23');
  });

  it('should determine if date is before another date', () => {
    const date = new Date('2021-07-23');
    const secondDate = new Date('2021-07-25');
    expect(isDateBefore(date, secondDate)).toBe(true);
    expect(isDateBefore(secondDate, date)).toBe(false);
  });

  it('should determine if date is in the future', () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    expect(isDateFuture(date)).toBe(true);

    const dateInPast = new Date();
    dateInPast.setDate(dateInPast.getDate() - 10);
    expect(isDateFuture(dateInPast)).toBe(false);
  });

  it('should determine if date is equal', () => {
    const date = new Date(2021, 8, 22);
    const second_date = new Date(2021, 8, 22);
    expect(isDateEqual(date, second_date)).toBe(true);

    second_date.setDate(second_date.getUTCDate() + 1);
    expect(isDateEqual(date, second_date)).toBe(false);
  });

  it('should determine if date is within this week', () => {
    const today = new Date();
    expect(isDateInThisWeek(today)).toBe(true);

    const someTimeInPast = new Date(2021, 0, 1);
    expect(isDateInThisWeek(someTimeInPast)).toBe(false);
  });

  it('should add weeks to a day', () => {
    const date = new Date(2021, 0, 1);
    const dateWithWeekAdded = addWeeksToDate(date, 1);
    expect(dateWithWeekAdded.getDate()).toEqual(8);
  });

  it('should get end of week given a day', () => {
    const date = new Date(2021, 6, 29);
    console.log(getEndOfWeek(date, 1))
    expect(getEndOfWeek(date, 1).getDate()).toBe(1);
  });

  it('should parse iso date', () => {
    const isoDateString = '2021-01-01';
    const parsed = parseIsoDate(isoDateString);
    expect(parsed.getDate()).toBe(1);
    expect(parsed.getMonth()).toBe(0);
    expect(parsed.getFullYear()).toBe(2021);
  });

  it('should get the start of a given day', () => {
    const date = new Date(2021, 0, 1, 20);
    const startOfDay = getStartOfDay(date);
    console.log(date, startOfDay)
    expect(startOfDay.getDate()).toBe(1);
    expect(startOfDay.getMonth()).toBe(0);
    expect(startOfDay.getFullYear()).toBe(2021);
    expect(startOfDay.getHours()).toBe(0);
  });
});
