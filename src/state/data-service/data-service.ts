import {State} from '@hookstate/core';

/***
 * Interface for a service providing tabular data.
 * T Row data type
 * R CRUD data type. Usually a dto.
 */
export interface DataService<T, R> {
  isPromised: boolean;
  state: State<T[]>;
  error: string | undefined;
  fetchAndStoreData(): Promise<T[]>;
  sendUpdate(toUpdate: R): Promise<T>;
  sendCreate(toCreate: R): Promise<T>;
  getDtoForRowData(rowData: T): Promise<R>;
}
