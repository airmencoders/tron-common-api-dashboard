import { createState, State, useState } from "@hookstate/core";
import { globalOpenapiConfig } from '../../api/openapi-config';
import { PrivilegeControllerApi, PrivilegeControllerApiInterface } from "../../openapi/apis/privilege-controller-api";
import { PrivilegeDto } from "../../openapi/models/privilege-dto";
import PrivilegeService from "./privilege-service";

const privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
const privilegeControllerApi: PrivilegeControllerApiInterface = new PrivilegeControllerApi(
  globalOpenapiConfig.configuration,
  globalOpenapiConfig.basePath,
  globalOpenapiConfig.axios
);

export const wrapState = (state: State<PrivilegeDto[]>, privilegeApi: PrivilegeControllerApiInterface): PrivilegeService => {
  return new PrivilegeService(state, privilegeApi);
};

export const accessPrivilegeState = () => wrapState(privilegeState, privilegeControllerApi);
export const usePrivilegeState = () => wrapState(useState(privilegeState), privilegeControllerApi);