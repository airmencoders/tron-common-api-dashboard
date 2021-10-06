import { State } from '@hookstate/core';
import { ValidateFunction } from 'ajv';
import ModelTypes from '../../api/model-types.json';
import {
  AppVersionControllerApiInterface, AppVersionInfoDto
} from '../../openapi';
import TypeValidation from '../../utils/TypeValidation/type-validation';

export default class AppInfoService {

  private readonly validate: ValidateFunction<AppVersionInfoDto>;

  constructor(public state: State<AppVersionInfoDto>, private appVersionApi: AppVersionControllerApiInterface) {
    this.validate = TypeValidation.validatorFor<AppVersionInfoDto>(ModelTypes.definitions.AppVersionInfoDto);
  }

  async fetchVersion(): Promise<void> {
    if (this.state.enclave.get() === '') {
      const requestPromise = await this.appVersionApi.getVersion();
      if (this.validate(requestPromise.data)) {
        this.state.set(requestPromise.data);
      }
    }
  }
}
