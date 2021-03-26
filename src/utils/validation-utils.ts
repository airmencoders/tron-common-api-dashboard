/**
 * 
 * @param text the text to test against the regex
 * @returns true if null or passes regex
 */
export function validPhone(text: string | undefined): boolean {
    return !text || /^(?:\([2-9]\d{2}\) ?|[2-9]\d{2}(?:-?| ?))[2-9]\d{2}[- ]?\d{4}$/.test(text);
} 

/**
 * 
 * @param text the text to test against the regex
 * @returns true if null or is digits with length between 5 and 10
 */
export function validDoDId(text: string | undefined): boolean {
  return !text || /^\d{5,10}$/.test(text);
} 