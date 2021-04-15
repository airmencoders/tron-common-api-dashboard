import {State} from '@hookstate/core';
import { DataCrudFormErrors } from '../../components/DataCrudFormPage/data-crud-form-errors';

/***
 * Interface for a service providing tabular data.
 * T Row data type
 * R Editable data type. Usually a dto.
 */
export interface DataService<T, R> {
  isPromised: boolean;
  state: State<T[]>;
  error: string | DataCrudFormErrors | undefined;
  fetchAndStoreData(): Promise<T[]>;
  sendUpdate(toUpdate: R): Promise<T>;
  sendCreate(toCreate: R): Promise<T>;
  sendDelete(toDelete: R): Promise<void>;
  sendPatch?: (...args : any) => Promise<T>;
  convertRowDataToEditableData(rowData: T): Promise<R>;
}
