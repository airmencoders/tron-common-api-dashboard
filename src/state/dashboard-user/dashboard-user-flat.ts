import { GridRowData } from "../../components/Grid/grid-row-data";
import { DashboardUserPrivilege } from "./dashboard-user-privilege";

export interface DashboardUserFlat extends DashboardUserPrivilege, GridRowData {
  id?: string;
  email: string;
}
