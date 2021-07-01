/***
 * Combines the provided arrays in order and deduplicates by key.
 * @param arrays Arrays to combine
 * @param keyVal Function providing the key value
 * @param keepFirst True will keep the first item if there are duplicate keys. False will keep the last item
 * if there are duplicate keys.
 */
export function combineArraysByKey<T>(arrays: Array<Array<T> | undefined>, keyVal: (item: T) => any,
                                      keepFirst = true):
    Array<T> {
  const combinedArrays = new Array<T>();
  const uniques: Record<any, T> = {};
  for(const array of arrays) {
    if (array != null) {
      combinedArrays.push(...array);
    }
  }
  for(const arrayVal of combinedArrays) {
    const valKey = keyVal(arrayVal);
    const doesExist = uniques[valKey] != null;
    if (keepFirst && doesExist) {
      continue;
    }
    uniques[valKey] = arrayVal;
  }
  return Object.values(uniques);
}
