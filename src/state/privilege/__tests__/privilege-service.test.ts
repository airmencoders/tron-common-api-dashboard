import { createState, State, StateMethodsDestroy } from "@hookstate/core";
import { AxiosResponse } from "axios";
import Config from "../../../api/configuration";
import { Configuration, Privilege, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto } from "../../../openapi";
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
      data: privilegeDtos,
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {}
    }
  });

  it('fetchAndStore', async () => {
    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>(resolve => resolve(axiosGetResponse));
    });

    await state.fetchAndStorePrivileges();

    expect(state.privileges).toEqual(privilegeDtos);
  });

  it('Convert Dto to Entity', () => {
    const privilegeDto: PrivilegeDto = privilegeDtos[0];

    const privilege: Privilege = {
      id: privilegeDto.id,
      name: privilegeDto.name
    };

    const result = state.convertDtoToEntity(privilegeDto);

    expect(result).toEqual(privilege);
  });

  it('Test error', async () => {
    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>((resolve, reject) => {
        setTimeout(() => {
          reject("Rejected")
        }, 1000)
      });
    });

    const fetch = state.fetchAndStorePrivileges();
    expect(state.error).toBe(undefined);

    await expect(fetch).rejects.toEqual("Rejected");
    expect(state.error).toBe("Rejected");
  });

  it('Test privileges', async () => {
    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>(resolve => setTimeout(() => resolve(axiosGetResponse), 1000));
    });

    const fetch = state.fetchAndStorePrivileges();
    expect(state.privileges).toEqual([]);

    await fetch;
    expect(state.privileges).toEqual(privilegeDtos);
  });

  it('Test isPromised', async () => {
    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>(resolve => setTimeout(() => resolve(axiosGetResponse), 1000));
    });

    const fetch = state.fetchAndStorePrivileges();
    expect(state.isPromised).toBeTruthy();

    await fetch;
    expect(state.isPromised).toBeFalsy();
  });

  it('createPrivilegeFromId', async () => {
    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>(resolve => resolve(axiosGetResponse));
    });

    await state.fetchAndStorePrivileges();

    const testPrivilege = privilegeDtos[0];
    const privilege = state.createPrivilegeFromId(testPrivilege.id ?? -1);

    expect(privilege?.id).toEqual(testPrivilege.id);
    expect(privilege?.name).toEqual(testPrivilege.name);
  });

  it('createPrivilegesFromIds', async () => {
    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>(resolve => resolve(axiosGetResponse));
    });

    await state.fetchAndStorePrivileges();

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