import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardUserDto, PrivilegeDto, ScratchStorageAppRegistryDto, ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../../openapi';
import { PrivilegeType } from '../../../state/privilege/privilege-type';
import { ScratchStorageFlat } from '../../../state/scratch-storage/scratch-storage-flat';
import ScratchStorageService from '../../../state/scratch-storage/scratch-storage-service';
import { useScratchStorageState } from '../../../state/scratch-storage/scratch-storage-state';
import ScratchStoragePage from '../ScratchStoragePage';
jest.mock('../../../state/scratch-storage/scratch-storage-state');
jest.mock('../../../state/privilege/privilege-service');

describe('Test Scratch Storage Page', () => {
  let scratchStorageState: State<ScratchStorageAppRegistryDto[]> & StateMethodsDestroy;
  let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
  let selectedScratchStorageState: State<ScratchStorageFlat> & StateMethodsDestroy;
  let scratchStorageApi: ScratchStorageControllerApiInterface;
  let privs : PrivilegeDto[] = [
    {
      id: 1,
      name: PrivilegeType.SCRATCH_READ
    },
    {
      id: 2,
      name: PrivilegeType.SCRATCH_WRITE
    },
    {
      id: 3,
      name: PrivilegeType.SCRATCH_ADMIN
    }
  ];

  const fullPrivilegeUser: DashboardUserDto = {
    id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
    email: 'test@person.com',
    privileges: [
      {
        'id': 1,
        'name': PrivilegeType.DASHBOARD_ADMIN
      },
      {
        'id': 2,
        'name': PrivilegeType.DASHBOARD_USER
      }
    ]
  };
  
  const getSelfDashboardUserResponse: AxiosResponse = {
    data: fullPrivilegeUser,
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {}
  };

  beforeEach(() => {
    scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());
    selectedScratchStorageState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);
    privilegeState = createState<PrivilegeDto[]>(privs);
    scratchStorageApi = new ScratchStorageControllerApi();
  });

  it('Test Loading Page',  async () => {
    function mockScratchStorageState() {
      (useScratchStorageState as jest.Mock).mockReturnValue(new ScratchStorageService(scratchStorageState, selectedScratchStorageState, scratchStorageApi, privilegeState));
      useScratchStorageState().fetchAndStoreData = jest.fn(() => Promise.resolve([]))
      jest.spyOn(useScratchStorageState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockScratchStorageState();
    const page = render(
      <MemoryRouter>
        <ScratchStoragePage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(page.getByText('Loading...')).toBeDefined()
    );
   });
 })
