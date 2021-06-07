import { AppClientPrivilege } from "./app-client-privilege"; 
import { AppClientDetails } from "./app-client-details"; 
import { GridRowData } from '../../components/Grid/grid-row-data';

export interface AppClientFlat extends AppClientPrivilege, AppClientDetails, GridRowData {
  id?: string;
  name: string;
  clusterUrl: string;
  appClientDeveloperEmails?: string[],  
}
