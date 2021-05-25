/**
 * 
 * @param text the text to test against the regex
 * @returns true if null or passes regex
 */
export function validPhone(text: string | undefined | null): boolean {
    return !text || /^(?:\([2-9]\d{2}\) ?|[2-9]\d{2}(?:-?| ?))[2-9]\d{2}[- ]?\d{4}$/.test(text);
} 

/**
 * 
 * @param text the text to test against the regex
 * @returns true if null or is digits with length between 5 and 10
 */
export function validDoDId(text: string | undefined | null): boolean {
  return !text || /^\d{5,10}$/.test(text);
} 

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
/**
 * Tests for a valid email. Null or undefined emails are not valid and will fail validation.
 * 
 * @param email the email to validate
 * @returns true if validation passed, false otherwise
 */
export function validateEmail(email: string | null | undefined): boolean {
  if (email == null)
    return false;

  if (email.trim().length === 0)
    return false;

  return emailRegex.test(email);
}

/**
 * Tests a required string. The string will be trimmed of whitespace.
 * 
 * The string must not be null or undefined.
 * The string must not be blank or empty.
 * If @param minLength and/or @param maxLength are set, then the string must also conform to that constraint.
 * 
 * @param value the value to validate
 * @param minLength the minimum length of the string (inclusive)
 * @param maxLength the maximum length of the string (inclusive)
 * @returns true if validation passed, false otherwise
 */
export function validateRequiredString(value: string | null | undefined, minLength?: number, maxLength?: number): boolean {
  if (value == null) {
    return false;
  }

  const trimmed = value.trim();

  if (trimmed.length <= 0)
    return false;

  if (minLength && trimmed.length < minLength)
    return false;

  if (maxLength && trimmed.length > maxLength)
    return false;

  return true;
}

/**
 * Checks that at least one value is marked as true
 * 
 * @param value array of booleans representing checkbox state
 * @returns true if at least one value is marked true
 */
export function validateCheckboxPrivileges(values: boolean[]): boolean {
  return values.some(value => value === true);
}

export const validationErrors = {
  requiredText: 'Cannot be blank or empty.',
  invalidEmail: 'Email is not valid.',
  atLeastOnePrivilege: 'At least one privilege must be set.',
  invalidPhone: 'Phone Number is not valid.',
  invalidDodid: 'DoD ID is invalid.'
} as const;