import {AppEndpointClientInfoDto} from '../../openapi/models';

export class AppSourceDevDetails {
  appSourceId: string;
  name: string;
  allowedEndpoints: AppEndpointClientInfoDto[] = [];

  constructor(appSourceId: string, name: string) {
    this.appSourceId = appSourceId;
    this.name = name;
  }
}
