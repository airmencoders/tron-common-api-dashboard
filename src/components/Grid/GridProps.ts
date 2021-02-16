import { RowClickedEvent } from 'ag-grid-community';
import GridColumn from './GridColumn';

export interface GridProps {
  data: Array<any>;
  columns: Array<GridColumn>;
  onRowClicked?: (event: RowClickedEvent) => void;
  rowClass?: string | string[];
}
