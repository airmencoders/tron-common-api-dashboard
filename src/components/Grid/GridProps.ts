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
}
