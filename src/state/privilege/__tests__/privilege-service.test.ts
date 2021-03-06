import { createState, State, StateMethodsDestroy } from "@hookstate/core";
import { AxiosResponse } from "axios";
import Config from "../../../api/config";
import { Configuration, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto, PrivilegeDtoResponseWrapper } from "../../../openapi";
import { prepareRequestError } from '../../../utils/ErrorHandling/error-handling-utils';
import { createGenericAxiosRequestErrorResponse } from '../../../utils/TestUtils/test-utils';
import PrivilegeService from "../privilege-service";

describe('Privilege Service', () => {
  let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
  let privilegeApi: PrivilegeControllerApiInterface;
  let state: PrivilegeService;
  let privilegeDtos: PrivilegeDto[];
  let axiosGetResponse: AxiosResponse;

  afterEach(() => {
    privilegeState.destroy();
  })

  beforeEach(() => {
    privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
    privilegeApi = new PrivilegeControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }));
    state = new PrivilegeService(privilegeState, privilegeApi);

    privilegeDtos = [
      {
        id: 0,
        name: 'READ'
      },
      {
        id: 1,
        name: 'WRITE'
      }
    ];

    axiosGetResponse = {
      data: { data: privilegeDtos },
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {}
    }
  });

  it('fetchAndStore', async () => {
    privilegeApi.getPrivilegesWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    const cancellableRequest = state.fetchAndStorePrivileges();
    await cancellableRequest.promise;

    expect(state.privileges).toEqual(privilegeDtos);
  });

  it('Convert Dto to Entity', () => {
    const privilegeDto: PrivilegeDto = privilegeDtos[0];

    const privilege: PrivilegeDto = {
      id: privilegeDto.id,
      name: privilegeDto.name
    };

    const result = state.convertDtoToEntity(privilegeDto);

    expect(result).toEqual(privilege);
  });

  it('Test error', async () => {
    const axiosErrorRequest = createGenericAxiosRequestErrorResponse();

    privilegeApi.getPrivilegesWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>((resolve, reject) => {
        setTimeout(() => {
          reject(axiosErrorRequest)
        }, 1000)
      });
    });

    const cancellableRequest = state.fetchAndStorePrivileges();
    expect(state.error).toBe(undefined);

    const requestError = prepareRequestError(axiosErrorRequest);
    await expect(cancellableRequest.promise).rejects.toEqual(requestError);
    expect(state.error).toEqual(requestError);
  });

  it('Test privileges', async () => {
    privilegeApi.getPrivilegesWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => setTimeout(() => resolve(axiosGetResponse), 1000));
    });

    const cancellableRequest = state.fetchAndStorePrivileges();
    expect(state.privileges).toEqual([]);

    await cancellableRequest.promise;
    expect(state.privileges).toEqual(privilegeDtos);
  });

  it('Test isPromised', async () => {
    privilegeApi.getPrivilegesWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => setTimeout(() => resolve(axiosGetResponse), 1000));
    });

    const cancellableRequest = state.fetchAndStorePrivileges();
    expect(state.isPromised).toBeTruthy();

    await cancellableRequest.promise;
    expect(state.isPromised).toBeFalsy();
  });

  it('createPrivilegeFromId', async () => {
    privilegeApi.getPrivilegesWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    const cancellableRequest = state.fetchAndStorePrivileges();
    await cancellableRequest.promise;

    const testPrivilege = privilegeDtos[0];
    const privilege = state.createPrivilegeFromId(testPrivilege.id ?? -1);

    expect(privilege?.id).toEqual(testPrivilege.id);
    expect(privilege?.name).toEqual(testPrivilege.name);
  });

  it('createPrivilegesFromIds', async () => {
    privilegeApi.getPrivilegesWrapped = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDtoResponseWrapper>>(resolve => resolve(axiosGetResponse));
    });

    const cancellableRequest = state.fetchAndStorePrivileges();
    await cancellableRequest.promise;

    let ids = [0];

    let privileges = state.createPrivilegesFromIds(ids);
    expect(privileges.length).toEqual(1);
    expect(privileges[0].name).toEqual(privilegeDtos[0].name);

    // Test ids not exist
    ids = [3];
    privileges = state.createPrivilegesFromIds(ids);
    expect(privileges.length).toEqual(0);
  });
});