import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppClientPage } from '../AppClientPage';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppClientControllerApi, AppClientControllerApiInterface, PrivilegeControllerApi, PrivilegeControllerApiInterface, PrivilegeDto } from '../../../openapi';
import { PrivilegeType } from '../../../state/privilege/privilege-type';
import { usePrivilegeState } from '../../../state/privilege/privilege-state';
import PrivilegeService from '../../../state/privilege/privilege-service';
import { AxiosResponse } from 'axios';
import { AppClientFlat } from '../../../state/app-clients/app-client-flat';
import { useAppClientsState } from '../../../state/app-clients/app-clients-state';
import AppClientsService from '../../../state/app-clients/app-clients-service';

jest.mock('../../../state/app-clients/app-clients-state');
jest.mock('../../../state/privilege/privilege-state');

describe('Test App Client Page', () => {
  const privilegeState = createState<PrivilegeDto[]>(new Array<PrivilegeDto>());
  const privilegeApi: PrivilegeControllerApiInterface = new PrivilegeControllerApi();

  const privilegDtos: PrivilegeDto[] = [
    {
      id: 1,
      name: PrivilegeType.READ
    },
    {
      id: 2,
      name: PrivilegeType.WRITE
    }
  ];

  function mockPrivilegesState() {
    (usePrivilegeState as jest.Mock).mockReturnValue(new PrivilegeService(privilegeState, privilegeApi));
    privilegeApi.getPrivileges = jest.fn(() => {
      return new Promise<AxiosResponse<PrivilegeDto[]>>(resolve => resolve({
        data: privilegDtos,
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });
  }

  const initialAppClientState: AppClientFlat[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test App Client 1",
      read: true,
      write: true
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      name: "Test App Client 2",
      read: false,
      write: false
    }
  ];

  let appClientState: State<AppClientFlat[]> & StateMethodsDestroy;
  let appClientApi: AppClientControllerApiInterface;

  beforeEach(() => {
    appClientState = createState<AppClientFlat[]>([...initialAppClientState]);
    appClientApi = new AppClientControllerApi();

    mockPrivilegesState();
  });

  it('Test Loading Page', async () => {
    function mockAppClientState() {
      (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientState, appClientApi));

      jest.spyOn(useAppClientsState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockAppClientState();

    const page = render(
      <MemoryRouter>
        <AppClientPage />
      </MemoryRouter>
    );

    expect(page.getByText('Loading...')).toBeDefined();
  });
})
