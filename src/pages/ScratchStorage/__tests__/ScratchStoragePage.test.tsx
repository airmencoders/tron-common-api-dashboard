import React from 'react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { ScratchStorageAppRegistryDto, ScratchStorageControllerApi, ScratchStorageControllerApiInterface } from '../../../openapi';
import { useScratchStorageState } from '../../../state/scratch-storage/scratch-storage-state';
import ScratchStoragePage from '../ScratchStoragePage';
import ScratchStorageService from '../../../state/scratch-storage/scratch-storage-service';
import { ScratchStorageFlat } from '../../../state/scratch-storage/scratch-storage-flat';

jest.mock('../../../state/scratch-storage/scratch-storage-state');

const server = setupServer(
  rest.get('/api/v2/scratch/apps', (req, res, ctx) => {
    return res(ctx.json(
      {
        data: [
          {
            id: 'some id', key: 'SOme Org', value: 'value', appId: '79d15bdb-43ff-4a55-a08d-2ea58a9f343a'
          }
        ]
      }
    ))
  })
)

describe('Test Scratch Storage Page', () => {
  let scratchStorageState: State<ScratchStorageAppRegistryDto[]> & StateMethodsDestroy;
  let selectedScratchStorageState: State<ScratchStorageFlat> & StateMethodsDestroy;
  let scratchStorageApi: ScratchStorageControllerApiInterface;

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

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

    await waitFor(() =>
      expect(page.getByText('Loading...')).toBeDefined()
    );
  });
})
