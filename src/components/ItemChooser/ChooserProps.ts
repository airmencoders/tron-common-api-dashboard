import { OrganizationDto, PersonDto } from '../../openapi';
import { RowClickedEvent } from 'ag-grid-community';
import GridColumn from '../Grid/GridColumn';

export interface ChooserProps {
  items: Array<PersonDto> | Array<OrganizationDto>,
  columns: Array<GridColumn>
  onRowClicked: (event: RowClickedEvent) => void;
}