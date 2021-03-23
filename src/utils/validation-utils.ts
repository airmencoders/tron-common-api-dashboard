/**
 * 
 * @param text the text to test against the regex
 * @returns true if null or passes regex
 */
export function validPhone(text: string | undefined): boolean {
    return !text || /^(?:\([2-9]\d{2}\) ?|[2-9]\d{2}(?:-?| ?))[2-9]\d{2}[- ]?\d{4}$/.test(text);
} 