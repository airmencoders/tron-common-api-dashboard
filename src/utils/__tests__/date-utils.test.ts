import { formatDateToEnCa, getFirstDayOfWeek, isDateBefore, isDateFuture } from '../date-utils';

describe('Date util tests', () => {
  it('should get the first day of the week', () => {
    const date = new Date('2021-07-23');
    const firstDayOfWeek = getFirstDayOfWeek(date, 1);
    const expected = new Date('2021-07-19');
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
});
