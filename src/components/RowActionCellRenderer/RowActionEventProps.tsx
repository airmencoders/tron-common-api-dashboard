import {GridCellRendererProps} from '../Grid/GridCellRendererProps';

export interface RowActionEventProps {
  onActionClick: (cellRendererProps: GridCellRendererProps<any>) => void;
}
