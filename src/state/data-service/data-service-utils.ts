import { State } from '@hookstate/core';
import { DataCrudFormErrors } from '../../components/DataCrudFormPage/data-crud-form-errors';
import { GridRowData } from '../../components/Grid/grid-row-data';
import { JsonPatchObjectArrayValue, JsonPatchObjectValue, JsonPatchStringArrayValue, JsonPatchStringValue, JsonPatchStringValueOpEnum } from '../../openapi';

export function prepareDataCrudErrorResponse(err: any): DataCrudFormErrors {
  if (err.response) { // Server responded with some error (4xx, 5xx)
    console.log(err.response)

    const validation = err.response.data.errors?.reduce((prev: any, current: any) => {
      const updated = { ...prev };
      updated[current.field] = current.defaultMessage;

      return updated;
    }, {});
    return {
      validation,
      general: err.response.data.message
    };
  } else if (err.request) { // Request never left
    return {
      general: 'Error contacting server. Try again later.'
    }
  } else { // Something else happened...
    return {
      general: err.message ?? 'Unknown error occurred.'
    }
  }
}

export function mergeDataToState<T extends GridRowData>(state: State<T[]>, toMerge: T[], checkDuplicates?: boolean): void {
  if (checkDuplicates) {
    const toBeAdded = new Array<T>();
    const dataMap = new Map(state.map(data => [data.id.get(), data]));

    toMerge.forEach(data => {
      const dup = dataMap.get(data.id);
      if (dup) {
        dup.set(data);
      } else {
        toBeAdded.push(data);
      }
    });

    if (toBeAdded.length > 0) {
      state.merge(toBeAdded);
    }

    return;
  }

  state.merge(toMerge);
}

export function createJsonPatchOp(op: JsonPatchStringValueOpEnum, path: string, value?: any): JsonPatchStringArrayValue | JsonPatchStringValue | JsonPatchObjectValue | JsonPatchObjectArrayValue {
  if (op === JsonPatchStringValueOpEnum.Copy || op === JsonPatchStringValueOpEnum.Move) {
    throw new Error(`JsonPatch ${op} is not supported`);
  }

  if (op === JsonPatchStringValueOpEnum.Remove) {
    return {
      op,
      path
    };
  }

  // Handles add, replace, test here
  if (value == null) {
    throw new Error(`JsonPatch ${op} requires the field "value" parameter to be set`)
  }

  return {
    op,
    path,
    value
  }
}

/**
 * Converts a list of Data items (contains id field) to a list of strings contains the ids of each item.
 * It also removes duplicate values.
 * 
 * @param items Data items
 * @returns array of string ids
 */
export function mapDataItemsToStringIds<T extends GridRowData>(items: T[]): string[] {
  const ids = items.reduce<string[]>((result, item) => {
    if (item.id != null) {
      result.push(String(item.id));
    }

    return result;
  }, []);

  const uniqueIds = new Set(ids);

  return Array.from(uniqueIds);
}

/**
 * Finds all items from toCheck that exist in original
 * 
 * @param original the original
 * @param toCheck the items to check against the original
 * @returns list of id strings of values in toCheck that exist in original
 */
export function getDataItemDuplicates<T extends GridRowData, R extends GridRowData>(original: T[], toCheck: R[]) {
  const originalIdSet = new Set(mapDataItemsToStringIds(original));
  const toCheckIdArr = mapDataItemsToStringIds(toCheck)

  const itemDups = toCheckIdArr.reduce<string[]>((result, id) => {
    if (id != null && originalIdSet.has(String(id))) {
      result.push(String(id));
    }

    return result;
  }, []);

  return itemDups;
}

/**
 * Finds all items from toCheck that do not exist in original
 * 
 * @param original the original
 * @param toCheck the items to check against the original
 * @returns list of id strings of values in toCheck that do not exist in original
 */
export function getDataItemNonDuplicates<T extends GridRowData, R extends GridRowData>(original: T[], toCheck: R[]) {
  const originalSet = new Set(mapDataItemsToStringIds(original));
  const toCheckIdArr = mapDataItemsToStringIds(toCheck)

  const itemDups = toCheckIdArr.reduce<string[]>((result, id) => {
    if (id != null && !originalSet.has(String(id))) {
      result.push(String(id));
    }

    return result;
  }, []);

  return itemDups;
}