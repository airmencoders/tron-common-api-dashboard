import { PrivilegeDto } from "../../openapi/models/privilege-dto";

export interface AppClientPrivilege {
  personCreate?: boolean,
  personEdit?: boolean,
  personDelete?: boolean,
  personRead?: boolean,
  orgCreate?: boolean,
  orgEdit?: boolean,
  orgDelete?: boolean,
  orgRead?: boolean,
  allPrivs?: PrivilegeDto[],
}