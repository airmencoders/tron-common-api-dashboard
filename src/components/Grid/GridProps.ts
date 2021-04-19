import { GridApi, RowClickedEvent } from 'ag-grid-community';
import GridColumn from './GridColumn';

export interface GridProps {
  data: Array<any>;
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
   * If set to true, it will disable column virtualization.
   * Defaults to FALSE (column virtualization enabled)
   */
  disabledGridColumnVirtualization?: boolean;

  className?: string;
}
