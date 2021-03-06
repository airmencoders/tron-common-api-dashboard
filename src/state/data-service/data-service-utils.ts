import { State } from '@hookstate/core';
import { AxiosPromise } from 'axios';
import { DataCrudFormErrors } from '../../components/DataCrudFormPage/data-crud-form-errors';
import { GridRowData } from '../../components/Grid/grid-row-data';
import { ExceptionResponse, JsonPatchObjectArrayValue, JsonPatchObjectValue, JsonPatchStringArrayValue, JsonPatchStringValue, JsonPatchStringValueOpEnum } from '../../openapi';
import { isDataRequestCancelError } from '../../utils/cancellable-data-request';

interface WrappedResponse<T> {
  data: T
}

export function prepareDataCrudErrorResponse(err: any): DataCrudFormErrors {
  if (err.response != null) { // Server responded with some error (4xx, 5xx)
    const exceptionResponse = err.response.data as ExceptionResponse;
    const validation = exceptionResponse.errors?.reduce<Record<string, string>>((prev: any, current) => {
      const updated = { ...prev };
      updated[current.fieldName] = current.defaultMessage;

      return updated;
    }, {});
    const validationKeyCount = validation != null ? Object.keys(validation).length : 0;
    const validationObject = validationKeyCount > 0 ? validation : undefined;
    return {
      validation: validationObject,
      general: validationObject == null ? err.response.data.reason : `Form Validation failed. Error count: ${validationKeyCount}`
    };
  } else if (err.request != null) { // Request never left
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
export function getDataItemDuplicates<T extends GridRowData, R extends GridRowData>(original: T[], toCheck: R[]): string[] {
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
export function getDataItemNonDuplicates<T extends GridRowData, R extends GridRowData>(original: T[], toCheck: R[]): string[] {
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

/**
 * Handles processing of axios requests returning wrapped data. Will also handle converting the data if given a {@link dataTransformation} function.
 * 
 * @template T the type of the request data
 * @template R Optional type. The type of the converted data. Will default to {@link T} if no {@link dataTransformation} function is given. The data will be force typed to {@link R} if provided.
 * 
 * @param {T} requestPromise the axios request
 * @returns {R} promise with default handling
 */
export function wrapDataCrudWrappedRequest<T, R = T>(requestPromise: AxiosPromise<WrappedResponse<T>>, dataTransformation?: (data: T) => R): Promise<R | never[]> {
  return requestPromise
    .then(response => {
      return dataTransformation ? dataTransformation(response.data.data) : response.data.data as unknown as R;
    })
    .catch(error => {
      if (isDataRequestCancelError(error)) {
        return [];
      }

      return Promise.reject(prepareDataCrudErrorResponse(error));
    });
}