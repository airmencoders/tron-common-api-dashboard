import { State } from '@hookstate/core';
import { ValidateFunction } from 'ajv';
import ModelTypes from '../../api/model-types.json';
import { FilterDto, HttpLogEntryDetailsDto, HttpLogEntryDto, HttpLogsControllerApi } from '../../openapi';
import TypeValidation from '../../utils/TypeValidation/type-validation';
import { AbstractDataService } from '../data-service/abstract-data-service';
import { SearchLogParams } from './audit-log-state';

export default class AuditLogService extends AbstractDataService<HttpLogEntryDto, HttpLogEntryDetailsDto> {
  private readonly validate: ValidateFunction<HttpLogEntryDto>;
  private readonly validateDetails: ValidateFunction<HttpLogEntryDetailsDto>;

  constructor(public state: State<HttpLogEntryDto[]>, 
              public searchParamsState: State<SearchLogParams>, 
              private httpLogControllerApi: HttpLogsControllerApi
              ) {
    super(state);
    this.validate = TypeValidation.validatorFor<HttpLogEntryDto>(ModelTypes.definitions.HttpLogEntryDto);
    this.validateDetails = TypeValidation.validatorFor<HttpLogEntryDetailsDto>(ModelTypes.definitions.HttpLogEntryDetailsDto);
  }

  async fetchAndStoreData(): Promise<HttpLogEntryDto[]> {        
    return Promise.reject("Cannot fetch data");
  }

  /**
  * Keeps track of changes to the filter
  */
  private filter?: FilterDto;

  /**
  * Keeps track of changes to the sort
  */
  private sort?: string[];

  async fetchAndStorePaginatedData(page: number, limit: number, checkDuplicates?: boolean, filter?: FilterDto, sort?: string[]): Promise<HttpLogEntryDto[]> {
    let httpResponseData: HttpLogEntryDto[] = [];
    try {        
      httpResponseData = await this.httpLogControllerApi.getHttpLogs(
            this.searchParamsState.date.value + "T00:00:00", 
            this.searchParamsState.requestMethod.value,
            this.searchParamsState.userNameContains.value,
            Number(this.searchParamsState.statusCode.value) || -1,
            this.searchParamsState.userAgentContains.value,
            this.searchParamsState.requestedUrlContains.value,
            page, 
            limit,
            sort).then(resp => {
        return resp.data.data;
      });
    } catch (err) {
      throw err;
    }

    this.mergeDataToState(httpResponseData, checkDuplicates);
    return httpResponseData;
  }

  async convertRowDataToEditableData(rowData: HttpLogEntryDto): Promise<HttpLogEntryDetailsDto> {
    const detailedLog = await this.httpLogControllerApi.getHttpLogDetails(rowData.id ?? '');
    return detailedLog.data;
  }

  async sendCreate(toCreate: HttpLogEntryDto): Promise<HttpLogEntryDto> {
    return Promise.reject("Cannot create a log entry");
  }

  async sendUpdate(toUpdate: HttpLogEntryDto): Promise<HttpLogEntryDto> {    
      return Promise.reject("Cannot edit log entry");
  }

  async sendDelete(toDelete: HttpLogEntryDto): Promise<void> {
    return Promise.reject("Cannot delete logs");
  }

  sendPatch: undefined;
  
}
