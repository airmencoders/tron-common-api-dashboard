import React from 'react';
import { DataService } from '../../state/data-service/data-service';
import GridColumn from '../Grid/GridColumn';
import { InfiniteScrollOptions } from './infinite-scroll-options';
import { CreateUpdateFormProps } from './CreateUpdateFormProps';
import { DataCrudDeleteComponentProps } from './DataCrudDeleteComponentProps';
import { SideDrawerSize } from '../SideDrawer/side-drawer-size';

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
   * Grid column definitions.
   */
  columns: GridColumn[];

  /**
   * React element of the form used to create the dto.
   * @param props Used by the create form.
   */
  createForm?: (props: CreateUpdateFormProps<R>) => JSX.Element;

  /**
   * React element of the form used to update the dto.
   * @param props Used by the update form.
   */
  updateForm?: (props: CreateUpdateFormProps<R>) => JSX.Element;

  /**
   * React element of the component used to delete the dto.
   * @param props Used by the delete component.
   */
  deleteComponent?: (props: DataCrudDeleteComponentProps<R | T>) => JSX.Element;

  /**
   * Page title
   */
  pageTitle: string;

  /**
   * Name of the data type
   */
  dataTypeName: string;

  /**
   * True allows the edit to be active.
   */
  allowEdit?: boolean;

  /**
   * True creates a new column, placed in the last column position.
   * {@link deleteComponent} must be defined if {@link allowDelete} is set to true to perform deletions
   */
  allowDelete?: boolean;

  /**
   * True allows the creation of asset
   * {@link createForm} must be defined if {@link allowAdd} is set to true to perform additions
   */
  allowAdd?: boolean;

  /**
   * Set to true to auto resize columns when window width is resized
   */
  autoResizeColumns?: boolean;

  /**
   * When set, auto resize of columns will only occur when window width greater than this value.
   * 0 will be used if no value is provided. Size in pixels.
   */
  autoResizeColummnsMinWidth?: number;

  /**
   * If set to true, it will disable column virtualization in the data grid.
   * Defaults to FALSE (column virtualization enabled)
   */
  disableGridColumnVirtualization?: boolean;

  className?: string;

  infiniteScrollOptions?: InfiniteScrollOptions;

  /**
   * Any JSX elements we want to render above the ag-grid (optional)
   */
  beforeChildren?: any;

  /**
   * An additional state object to monitor so we can control updates on the outside if needed
   */
  refreshState?: boolean;

  /**
   * Optional callback that happens after a infinite scroll datasource updates on the ag-grid
   */
  refreshStateCallback?: () => void;

  /**
   * Optional boolean to say to scroll to top or not
   */
  scrollToTop?: boolean;

  /**
   * Optional callback to say when we've scrolled to top
   */
  scrollToTopCallback?: () => void;

  sideDrawerSize?: SideDrawerSize;

  dataTypeIcon?: React.ReactNode;
}
