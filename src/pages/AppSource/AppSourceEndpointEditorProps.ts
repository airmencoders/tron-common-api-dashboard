import { State } from '@hookstate/core';
import { AppClientUserPrivDto, AppEndpointDto, AppSourceDto } from '../../openapi';

export interface AppSourceEndpointEditorProps {
  appClientPrivileges: State<AppClientUserPrivDto[]>;
  selectedEndpoints: State<AppEndpointDto[]>;
  appSourceId: State<string>
}