import { AppClientPrivilege } from "./app-client-privilege";
import { GridRowData } from '../../components/Grid/grid-row-data';

export interface AppClientFlat extends AppClientPrivilege, GridRowData {
  id?: string;
  name: string;
}
