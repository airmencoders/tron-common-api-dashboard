import { GridApi, RowClickedEvent } from 'ag-grid-community';
import { GridSelectionType } from './grid-selection-type';
import GridColumn from './GridColumn';

export interface GridProps {
  data?: Array<any>;
  columns: Array<GridColumn>;
  onRowClicked?: (event: RowClickedEvent) => void;
  onGridReady?: (event: GridApi | undefined) => void;
  rowClass?: string | string[];
  height?: string;
  quickFilterText?: string;
  rowSelection?: string;
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
   * Set to true to force cells to refresh when the grid resizes columns.
   * {@link autoResizeColumns} must be set to true for this to take effect.
   */
  forceCellRefreshOnResize?: boolean;

  /**
   * If set to true, it will disable column virtualization.
   * Defaults to FALSE (column virtualization enabled)
   */
  disabledGridColumnVirtualization?: boolean;

  /**
   * If set to true, it will force the enter grid to be
   * refreshed as opposed to the changed cells
   */
  hardRefresh?: boolean;

  className?: string;
  suppressRowClickSelection?: boolean;
  suppressCellSelection?: boolean;

  /**
   * Returns the data of the row and the event that occurred (selected or unselected)
   */
  onRowSelected?: (data: any, selectionEvent: GridSelectionType) => void;

  rowModelType?: string;

  getRowNodeId?: ((item: any) => string);
  
  scrollToTop?: boolean;
  scrollToTopCallback?: () => void;

  immutableData?: boolean;

  /**
   * Used only when {@link rowSelection} is set to 'single'
   * Will pass the data of the selected row or undefined
   * when unselected.
   */
  onSelectionChanged?: (data?: any) => void;
}
