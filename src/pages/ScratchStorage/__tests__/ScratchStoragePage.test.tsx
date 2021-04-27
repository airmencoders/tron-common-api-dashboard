import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { ScratchStorageAppRegistryDto, ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../../openapi';
import { useAppSourceState } from '../../../state/app-source/app-source-state';
import { useScratchStorageState } from '../../../state/scratch-storage/scratch-storage-state';
import ScratchStoragePage from '../ScratchStoragePage';
import ScratchStorageService from '../../../state/scratch-storage/scratch-storage-service';
import { ScratchStorageFlat } from '../../../state/scratch-storage/scratch-storage-flat';

jest.mock('../../../state/scratch-storage/scratch-storage-state');

describe('Test Scratch Storage Page', () => {
  let scratchStorageState: State<ScratchStorageAppRegistryDto[]> & StateMethodsDestroy;
  let selectedScratchStorageState: State<ScratchStorageFlat> & StateMethodsDestroy;
  let scratchStorageApi: ScratchStorageControllerApiInterface;

  beforeEach(() => {
    scratchStorageState = createState<ScratchStorageAppRegistryDto[]>(new Array<ScratchStorageAppRegistryDto>());
    selectedScratchStorageState = createState<ScratchStorageFlat>({} as ScratchStorageFlat);
    scratchStorageApi = new ScratchStorageControllerApi();
  });

  it('Test Loading Page', async () => {
    function mockScratchStorageState() {
      (useScratchStorageState as jest.Mock).mockReturnValue(new ScratchStorageService(scratchStorageState, selectedScratchStorageState, scratchStorageApi));

      jest.spyOn(useScratchStorageState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockScratchStorageState();

    const page = render(
      <MemoryRouter>
        <ScratchStoragePage />
      </MemoryRouter>
    );

    expect(page.getByText('Loading...')).toBeDefined();
  });
})
