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

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/**
 * 
 * @param email the email to validate
 * @returns true if null or passes Regex test else false
 */
export function validateEmail(email: string): boolean {
  if (email == null)
    return true;

  if (email.trim().length === 0)
    return false;

  return emailRegex.test(email.toLowerCase());
}