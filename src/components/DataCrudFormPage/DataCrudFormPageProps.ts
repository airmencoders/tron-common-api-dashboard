import {DataService} from '../../state/data-service/data-service';
import {State} from '@hookstate/core';
import {CrudPageState} from '../../state/crud-page/crud-page-state';
import GridColumn from '../Grid/GridColumn';
import {CreateUpdateFormProps} from './CreateUpdateFormProps';
import { DeleteComponentProps } from './DeleteComponentProps';

/***
 * T Row data type.
 * R CRUD data type.
 */
export interface DataCrudFormPageProps<T, R> {
  /**
   * Hook used to access the service to fetch and update data.
   * */
  useDataState: () => DataService<T, R>;

  /**
   * Hook used to track the page state.
   */
  usePageState: <R>() => State<CrudPageState<R>>;

  /**
   * Grid column definitions.
   */
  columns: GridColumn[];

  /**
   * React element of the form used to create the dto.
   * @param props Used by the create form.
   */
  createForm: (props: CreateUpdateFormProps<R>) => JSX.Element;

  /**
   * React element of the form used to update the dto.
   * @param props Used by the update form.
   */
  updateForm: (props: CreateUpdateFormProps<R>) => JSX.Element;

  /**
   * React element of the component used to delete the dto.
   * @param props Used by the delete component.
   */
  deleteComponent?: (props: DeleteComponentProps<R>) => JSX.Element;

  /**
   * Page title
   */
  pageTitle: string;

  /**
   * Name of the data type
   */
  dataTypeName: string;

  /**
   * True allows the edit and create affordances to be active.
   */
  allowEdit: boolean;

  /**
   * True creates a new column, placed in the last column position.
   * {@link deleteComponent} must be defined if {@link allowDelete} is set to true to perform deletions
   */
  allowDelete?: boolean;
}
