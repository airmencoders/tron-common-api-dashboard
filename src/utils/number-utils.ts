
export function setSignificantDigits(number: number, significantDigits: number): number {
  return parseFloat(number.toFixed(significantDigits));
}
