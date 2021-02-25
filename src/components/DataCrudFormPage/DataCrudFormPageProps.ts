import {DataService} from '../../state/data-service/data-service';
import {State} from '@hookstate/core';
import {CrudPageState} from '../../state/crud-page/crud-page-state';
import GridColumn from '../Grid/GridColumn';

/***
 * T Row data type.
 * R CRUD data type.
 */
export interface DataCrudFormPageProps<T, R> {
  useDataState: () => DataService<T, R>;
  usePageState: <T>() => State<CrudPageState<T>>;
  columns: GridColumn[];
  createForm: (props: any) => JSX.Element;
  updateForm: (props: any) => JSX.Element;
  pageTitle: string;
  dataTypeName: string;
}
