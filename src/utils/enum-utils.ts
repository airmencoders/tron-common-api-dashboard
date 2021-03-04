/**
 * Returns the key for an enum type based on the string value
 * @param myEnum The enum type
 * @param enumValue Enum string value
 */
export function getEnumKeyByEnumValue<T extends {[index:string]:string}>(myEnum:T, enumValue:string):keyof T|null {
  let keys = Object.keys(myEnum).filter(x => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : null;
}
