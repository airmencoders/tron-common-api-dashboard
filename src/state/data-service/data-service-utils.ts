import { State } from '@hookstate/core';
import { DataCrudFormErrors } from '../../components/DataCrudFormPage/data-crud-form-errors';
import { GridRowData } from '../../components/Grid/grid-row-data';
import { JsonPatchObjectArrayValue, JsonPatchObjectValue, JsonPatchStringArrayValue, JsonPatchStringValue, JsonPatchStringValueOpEnum } from '../../openapi';

export function prepareDataCrudErrorResponse(err: any): DataCrudFormErrors {
  if (err.response) { // Server responded with some error (4xx, 5xx)
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