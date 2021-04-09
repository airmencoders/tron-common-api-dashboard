import { State } from "@hookstate/core";
import { AppClientUserPrivDto, AppEndpointDto } from "../../openapi";

export interface AppSourceEndpointEditorProps {
  appClientPrivileges: State<AppClientUserPrivDto[]>;
  endpoint: State<AppEndpointDto>;
}