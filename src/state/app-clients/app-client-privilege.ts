import { PrivilegeDto } from "../../openapi/models/privilege-dto";

export interface AppClientPrivilege {
  personCreate?: boolean,
  personEdit?: boolean,
  personDelete?: boolean,
  orgCreate?: boolean,
  orgEdit?: boolean,
  orgDelete?: boolean,
  allPrivs?: PrivilegeDto[],
}