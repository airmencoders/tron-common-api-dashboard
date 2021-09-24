import { State } from '@hookstate/core';
import { Touched } from '@hookstate/touched';
import { Validation } from '@hookstate/validation';

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
 * Tests for a valid email.
 * 
 * @param email the email to validate
 * @returns true if validation passed or {@link email} is null/undefined or {@link email} length === 0, false otherwise
 */
export function validateEmail(email: string | null | undefined): boolean {
  return email == null || email.length === 0 || emailRegex.test(email);
}

/**
 * Tests for a valid pubsub address
 * @param value pubsub subscriber address
 * @returns true if validation passed
 */
export function validateSubscriberAddress(url: string | undefined): boolean {
  return url != null && (url.length ===0 || /^http:\/\/(?!tron-common-api).+?\.(?!tron-common-api).+?\.svc.cluster.local\//.test(url));
}

/**
 * Tests a required string. The string will be trimmed of whitespace.
 * 
 * The string must not be null or undefined.
 * The string must not be blank or empty.
 * 
 * @param value the value to validate
 * @returns true if validation passed, false otherwise
 */
export function validateRequiredString(value: string | null | undefined): boolean {
  if (value == null) {
    return false;
  }

  const trimmed = value.trim();

  if (trimmed.length <= 0)
    return false;

  return true;
}

/**
 * Validates that a string's length meets length constraints. String will be trimmed when validating length constraints.
 * 
 * @param value the string to validate
 * @param minLength the min length of the string. Defaults to 1 (inclusive)
 * @param maxLength the max length of the string. Defaults to 255 (inclusive)
 * @returns true if string is null, undefined, or passes validation, false otherwise
 */
export function validateStringLength(value: string | null | undefined, minLength = 1, maxLength = 255) {
  if (value == null || value.length === 0)
    return true;

  const trimmed = value.trim();

  if (trimmed.length < minLength)
    return false;

  if (trimmed.length > maxLength)
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

/**
 * Generates an array of string error messages from hookstate validation.
 * Hookstate Validation plugin must be attached to the state otherwise
 * a Hookstate exception will be thrown.
 * 
 * @param state the Hookstate value to generate errors off
 * @returns array of string errors
 */
export function generateStringErrorMessages<T>(state: State<T>): string[] {
  return Validation(state).errors().map(validationError => validationError.message);
}

/**
 * Checks if a Hookstate state fails validation and has been touched.
 * Uses Hookstate Touched and Validation plugins. Initial, Touched, and Validation plugins
 * must be attached to the state otherwise a Hookstate exception will be thrown.
 * 
 * @param state the Hookstate value to check validation
 * @returns true if touched and fails validation, false otherwise
 */
export function failsHookstateValidation<T>(state: State<T>): boolean {
  return Touched(state).touched() && Validation(state).invalid();
}

export const validationErrors = {
  requiredText: 'Cannot be blank or empty.',
  invalidEmail: 'Email is not valid.',
  atLeastOnePrivilege: 'At least one privilege must be set.',
  invalidPhone: 'Phone Number is not valid.',
  invalidDodid: 'DoD ID is invalid.',
  generateStringLengthError(minLength = 1, maxLength = 255): string {
    return `Must have ${minLength} to ${maxLength} characters.`
  }
} as const;

/**
 * Helper function to get a property of a object.
 */
export function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName];
}

/**
 * Compares the two objects to see if any fields contain values
 * that do not match.
 * 
 * @param original The first object
 * @param toCheck The second object
 * @returns true if some property of {@link original} does not match the associated property of {@link toCheck} or if either is null or undefined
 */
export function isFormModified<T>(original: T, toCheck: T): boolean {
  if (original == null || toCheck == null)
    return true;

  return Object.keys(original).some(key => {
    return getProperty(original, key as keyof T) !== getProperty(toCheck, key as keyof T);
  });
}

const nullableStringTypes = ['null', 'string'];
interface SchemaFieldFormat {
  type?: string | string[];
  $ref?: string;
}
/**
 * Extracts the string fields that are nullable from a JSON Schema.
 * A field must have the types 'null' and 'string' to be considered
 * a nullable field.
 * 
 * 
 * @param schema schema to extract nullable string fields from
 */
export function getNullableFieldsFromSchema<T>(schema: Record<string, SchemaFieldFormat>): Set<keyof T> {
  const nullableStringFields = new Set<keyof T>();

  Object.entries(schema).forEach(([field, value]) => {
    const hasTypeProperty = value.hasOwnProperty('type');
    if (hasTypeProperty) {
      const typeValue = value as { type: string | string[] };
      if (typeValue.type instanceof Array) {
        const isNullableString = nullableStringTypes.every(nullableType => typeValue.type.includes(nullableType));

        if (isNullableString) {
          nullableStringFields.add(field as keyof T);
        }
      }
    }
  });

  return nullableStringFields;
}

/**
 * Validates a document space name according to AWS's S3 bucket naming rules 
 * and the Common API rules
 * @param name 
 * @returns 
 */
export function validateDocSpaceName(name: string): boolean {
  if (!name) return false; // null check
  if (/\s+/.test(name)) return false; // whitespace check
  if (name.length < 3 || name.length > 63) return false; // length constraints
  if (/[A-Z]+/.test(name)) return false; // no upper case letters
  if (!/^[a-z0-9]/.test(name) || !/[a-z0-9]$/.test(name)) return false; // must start and end with letter or number
  if (/[0-9]{,3}\.[0-9]{,3}\.[0-9]{,3}\.[0-9]{,3}/.test(name)) return false; // cant be an IP address shape
  if (name.startsWith("xn--")) return false; // cant start with this
  if (name.endsWith("-s3alias")) return false; // cant end with this
  if (name.indexOf("/") !== -1) return false; // no slashes
  return true;
}