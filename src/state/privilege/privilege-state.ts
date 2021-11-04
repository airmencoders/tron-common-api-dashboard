import { createState, State, useState } from "@hookstate/core";
import Config from "../../api/config";
import { openapiAxiosInstance } from '../../api/openapi-axios';
import { Configuration } from "../../openapi";
import { PrivilegeControllerApi, PrivilegeControllerApiInterface } from "../../openapi/apis/privilege-controller-api";
import { PrivilegeDto } from "../../openapi/models/privilege-dto";
import PrivilegeService from "./privilege-service";

const privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
const privilegeControllerApi: PrivilegeControllerApiInterface = new PrivilegeControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }), '', openapiAxiosInstance);

export const wrapState = (state: State<PrivilegeDto[]>, privilegeApi: PrivilegeControllerApiInterface): PrivilegeService => {
  return new PrivilegeService(state, privilegeApi);
};

export const accessPrivilegeState = () => wrapState(privilegeState, privilegeControllerApi);
export const usePrivilegeState = () => wrapState(useState(privilegeState), privilegeControllerApi);