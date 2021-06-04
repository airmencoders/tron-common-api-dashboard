import { State } from '@hookstate/core';
import { DataCrudFormErrors } from '../../components/DataCrudFormPage/data-crud-form-errors';
import { FilterDto } from '../../openapi';

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
  sendPatch?(...args: any): Promise<T>;
  /**
   * @param {number} page the page number (0 indexed)
   * @param {number} limit the max items to return
   */
  fetchAndStorePaginatedData?: (page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]) => Promise<T[]>;
  convertRowDataToEditableData(rowData: T): Promise<R>;
  resetState: () => void;
}