import { AxiosResponse } from 'axios';
import { EventRequestLogControllerApi, EventRequestLogControllerApiInterface, EventRequestLogDto, EventRequestLogDtoEventTypeEnum, EventRequestLogDtoPaginationResponseWrapper } from '../../../openapi';
import { createAxiosSuccessResponse, createGenericAxiosRequestErrorResponse } from '../../../utils/TestUtils/test-utils';
import { EventRequestLogDtoFlat } from '../event-request-log-dto-flat';
import EventRequestLogService from '../event-request-log-service';

describe('Test Event Request Log', () => {
  const appId = "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8";

  const dto: EventRequestLogDto = {
    appClientUser: {
      id: appId,
      name: "guardianangel"
    },
    eventType: EventRequestLogDtoEventTypeEnum.OrganizationChange,
    eventCount: 523,
    wasSuccessful: false,
    reason: "Event request to recipient failed: 404 NOT_FOUND",
    lastAttempted: "2021-09-03T12:56:44.482Z"
  };

  const flatDto: EventRequestLogDtoFlat = {
    eventType: dto.eventType,
    eventCount: dto.eventCount,
    wasSuccessful: dto.wasSuccessful,
    reason: dto.reason,
    lastAttempted: dto.lastAttempted
  };

  const eventRequestLogResponse: AxiosResponse<EventRequestLogDtoPaginationResponseWrapper> = createAxiosSuccessResponse({
    data: [dto],
    pagination: {
      page: 0,
      size: 1,
      totalElements: 29,
      totalPages: 15,
      links: {
        next: "http://localhost:8888/api/v2/event-request-log/all?page=1&size=2",
        last: "http://localhost:8888/api/v2/event-request-log/all?page=14&size=2"
      }
    }
  });

  let eventRequestLogApi: EventRequestLogControllerApiInterface;
  let eventRequestLogService: EventRequestLogService;

  beforeEach(() => {
    eventRequestLogApi = new EventRequestLogControllerApi();
    eventRequestLogService = new EventRequestLogService(eventRequestLogApi);
  });

  it('should create datasource and fetch non-filtered data', (done) => {
    eventRequestLogApi.getEventRequestLogsByAppClientId = jest.fn(() => {
      return Promise.resolve(eventRequestLogResponse);
    });

    const apiRequestSpy = jest.spyOn(eventRequestLogApi, 'getEventRequestLogsByAppClientId');

    const onSuccess = jest.fn((data, lastRow) => {
      try {
        expect(data).toEqual(expect.arrayContaining(eventRequestLogService.convertDtosToFlat(eventRequestLogResponse.data.data)));
        done();
      } catch (err) {
        done(err);
      }
    });
    const onFail = jest.fn();
    const datasource = eventRequestLogService.createDatasource(appId);
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fetch filtered/sorted data', (done) => {
    eventRequestLogApi.getEventRequestLogsByAppClientIdWithFilter = jest.fn(() => {
      return Promise.resolve(eventRequestLogResponse);
    });

    const apiRequestSpy = jest.spyOn(eventRequestLogApi, 'getEventRequestLogsByAppClientIdWithFilter');

    const onSuccess = jest.fn((data, lastRow) => {
      try {
        expect(data).toEqual(expect.arrayContaining(eventRequestLogService.convertDtosToFlat(eventRequestLogResponse.data.data)));
        done();
      } catch (err) {
        done(err);
      }
    });
    const onFail = jest.fn();
    const datasource = eventRequestLogService.createDatasource(appId);
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [
        {
          sort: "asc",
          colId: "eventCount"
        }
      ],
      filterModel: {
        eventCount: {
          filterType: "number",
          type: "equals",
          filter: 523
        }
      },
      context: undefined
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fail on bad filter object', () => {
    const onSuccess = jest.fn();
    const onFail = jest.fn();
    const datasource = eventRequestLogService.createDatasource(appId);
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [
        {
          sort: "asc",
          colId: "eventCount"
        }
      ],
      filterModel: {
        bad: {
          filter: "asdf"
        }
      },
      context: undefined
    });

    expect(onFail.mock.calls.length).toBe(1);
  });

  it('should create datasource and fail on bad filter validation from server 400 bad request', (done) => {
    const badRequestError = createGenericAxiosRequestErrorResponse(400);

    eventRequestLogApi.getEventRequestLogsByAppClientIdWithFilter = jest.fn(() => {
      return Promise.reject(badRequestError);
    });

    const apiRequestSpy = jest.spyOn(eventRequestLogApi, 'getEventRequestLogsByAppClientIdWithFilter');

    const onSuccess = jest.fn();
    const onFail = jest.fn(() => {
      try {
        done();
      } catch (err) {
        done(err);
      }
    });
    const datasource = eventRequestLogService.createDatasource(appId);
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [
        {
          sort: "asc",
          colId: "eventCount"
        }
      ],
      filterModel: {
        eventCount: {
          filterType: "number",
          type: "equals",
          filter: 523
        }
      },
      context: undefined
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fail on server error, non 400 response', (done) => {
    const badRequestError = createGenericAxiosRequestErrorResponse(500);

    eventRequestLogApi.getEventRequestLogsByAppClientId = jest.fn(() => {
      return Promise.reject(badRequestError);
    });

    const apiRequestSpy = jest.spyOn(eventRequestLogApi, 'getEventRequestLogsByAppClientId');

    const onSuccess = jest.fn();
    const onFail = jest.fn(() => {
      try {
        done();
      } catch (err) {
        done(err);
      }
    });
    const datasource = eventRequestLogService.createDatasource(appId);
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fail on catch all', (done) => {
    eventRequestLogApi.getEventRequestLogsByAppClientId = jest.fn(() => {
      return Promise.reject(new Error('Catch all exception'));
    });

    const apiRequestSpy = jest.spyOn(eventRequestLogApi, 'getEventRequestLogsByAppClientId');

    const onSuccess = jest.fn();
    const onFail = jest.fn(() => {
      try {
        done();
      } catch (err) {
        done(err);
      }
    });
    const datasource = eventRequestLogService.createDatasource(appId);
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should convert dto to flat', () => {
    expect(eventRequestLogService.convertDtoToFlat(dto)).toEqual(flatDto);
  });

  it('should convert array of dtos to array of flat dtos', () => {
    expect(eventRequestLogService.convertDtosToFlat([dto])).toEqual(expect.arrayContaining([flatDto]));
  });
});
