import { postpone, State } from '@hookstate/core';
import { GridRowData } from '../../components/Grid/grid-row-data';
import { FilterDto } from '../../openapi';
import { CancellableDataRequest } from '../../utils/cancellable-data-request';
import { DataService } from './data-service';
import { PatchResponse } from './patch-response';

export abstract class AbstractDataService<T extends GridRowData, R> implements DataService<T, R> {
  constructor(public state: State<T[]>) {

  }

  abstract fetchAndStoreData(): CancellableDataRequest<T[]>;
  abstract fetchAndStorePaginatedData?(page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]): Promise<T[]>;
  abstract sendUpdate(toUpdate: R): Promise<T>;
  abstract sendCreate(toCreate: R): Promise<T>;
  abstract sendDelete(toDelete: R): Promise<void>;
  abstract sendPatch?(...args: any): Promise<PatchResponse<T>>;
  abstract convertRowDataToEditableData(rowData: T): Promise<R>;

  get isPromised(): boolean {
    return this.state.promised;
  }

  get error(): any | undefined {
    return this.state.promised ? undefined : this.state.error;
  }

  resetState(): void {
    this.state.batch((state) => {
      if (state.promised) {
        return postpone;
      }

      this.state.set([]);
    });
  }

  /**
   * Merges data into the state. If @param checkDuplicates is set to true, the state will be checked for duplicates
   * against the @param toMerge array. If a duplicate is found, the duplicate's value is updated to the new value,
   * otherwise the value is merged into state.
   * 
   * @param toMerge the array of data to merge into state
   * @param checkDuplicates true to check for duplicates
   */
  mergeDataToState(toMerge: T[], checkDuplicates?: boolean): void {
    if (checkDuplicates) {
      const toBeAdded = new Array<T>();
      const dataMap = new Map(this.state.map(data => [data.id.get(), data]));

      toMerge.forEach(data => {
        const dup = dataMap.get(data.id);
        if (dup) {
          dup.set(data);
        } else {
          toBeAdded.push(data);
        }
      });

      if (toBeAdded.length > 0) {
        this.state.merge(toBeAdded);
      }

      return;
    }

    this.state.merge(toMerge);
  }
}