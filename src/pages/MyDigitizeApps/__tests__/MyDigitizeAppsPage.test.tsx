import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { ScratchStorageControllerApi } from '../../../openapi';
import MyDigitizeAppsPage from '../MyDigitizeAppsPage';
import { ScratchStorageAppFlat } from '../../../state/my-digitize-apps/scratch-storage-app-flat';
import MyDigitizeAppsService from '../../../state/my-digitize-apps/my-digitize-apps-service';
import { useMyDigitizeAppsState } from '../../../state/my-digitize-apps/my-digitize-apps-state';

jest.mock('../../../state/my-digitize-apps/my-digitize-apps-state');

describe('Test My Digitize Apps Page', () => {
  const initialAppsState: ScratchStorageAppFlat[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      appName: "Test App Client 1",
      appHasImplicitRead: true,
      scratchAdmin: true,
      scratchRead: true,
      scratchWrite: true
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      appName: "Test App Client 2",
      appHasImplicitRead: true,
      scratchAdmin: false,
      scratchRead: true,
      scratchWrite: false
    }
  ];

  let digitizeAppsState: State<ScratchStorageAppFlat[]> & StateMethodsDestroy;
  let digitizeAppsApi: ScratchStorageControllerApi;

  beforeEach(() => {
    digitizeAppsState = createState<ScratchStorageAppFlat[]>([...initialAppsState]);
    digitizeAppsApi = new ScratchStorageControllerApi();
  });

  it('Test Loading Page', async () => {
    function mockAppClientState() {
      (useMyDigitizeAppsState as jest.Mock).mockReturnValue(new MyDigitizeAppsService(digitizeAppsState, digitizeAppsApi));

      jest.spyOn(useMyDigitizeAppsState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockAppClientState();

    const page = render(
      <MemoryRouter>
        <MyDigitizeAppsPage />
      </MemoryRouter>
    );

    expect(page.getByText('Loading...')).toBeDefined();
  });
})
