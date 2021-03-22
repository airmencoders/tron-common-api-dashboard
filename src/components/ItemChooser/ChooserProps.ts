import { RowClickedEvent } from 'ag-grid-community';
import GridColumn from '../Grid/GridColumn';

export interface ChooserProps {
  items: Array<any>,
  columns: Array<GridColumn>
  onRowClicked: (event: RowClickedEvent) => void;
}