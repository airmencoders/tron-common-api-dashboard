import {GridApi, RowClickedEvent} from 'ag-grid-community';
import GridColumn from '../Grid/GridColumn';

export interface ChooserProps {
  items: Array<any>;
  columns: Array<GridColumn>
  onRowClicked: (event: RowClickedEvent) => void;
  hardRefresh?: boolean;
  rowSelection?: string;
  suppressRowClickSelection?: boolean;
  showEditBtn?: boolean;
  disableEditBtn?: boolean;
  onEditBtnClick?: () => void;
  onRowSelected?: (data: any, selectionEvent: 'selected' | 'unselected') => void;
  onGridReady?: (event: GridApi | undefined) => void;
}
