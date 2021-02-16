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

    expect(state.privileges?.get()).toEqual(privilegeDtos);
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
    expect(state.privileges).toBe(undefined);

    await fetch;
    expect(state.privileges?.get()).toEqual(privilegeDtos);
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

});