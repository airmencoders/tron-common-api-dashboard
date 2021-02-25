import { ClientPrivilege } from "./app-client-privilege";
import {GridRowData} from '../../../components/Grid/grid-row-data';

export interface AppClientFlat extends ClientPrivilege, GridRowData {
  id?: string;
  name: string;
}
