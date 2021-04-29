import React from 'react';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { AppClientSummaryDto, AppClientUserPrivDto, AppEndpointDto, AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDto } from '../../../openapi';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import AppSourceEndpointEditor from '../AppSourceEndpointEditor';
import { AxiosResponse } from 'axios';
import AppSourceService from '../../../state/app-source/app-source-service';
import { useAppSourceState } from '../../../state/app-source/app-source-state';

jest.mock('../../../state/app-source/app-source-state');

describe('Test App Source Endpoint Editor', () => {
  let appClientPrivileges: State<AppClientUserPrivDto[]> & StateMethodsDestroy;
  let appClientEndpointState: State<AppEndpointDto> & StateMethodsDestroy;
  let allClients: AppClientSummaryDto[];
  let appSourceState: State<AppSourceDto[]> & StateMethodsDestroy;
  let appSourceApi: AppSourceControllerApiInterface;
  let appSourceService: AppSourceService;

  beforeEach(() => {
    appSourceState = createState<AppSourceDto[]>(new Array<AppSourceDto>());
    appSourceApi = new AppSourceControllerApi();
    appSourceService = new AppSourceService(appSourceState, appSourceApi);

    appClientPrivileges = createState<AppClientUserPrivDto[]>([
      {
        id: '77fbfe12-691c-4fce-be83-6065163c8267',
        appClientUser: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd1',
        appClientUserName: 'App Client 1',
        appEndpoint: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
      }
    ]);

    appClientEndpointState = createState<AppEndpointDto>({
      id: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
      path: '/training-svc/training-program',
      requestType: 'GET'
    });

    allClients = [
      {
        id: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd1',
        name: 'App Client 1',
      }
    ];
  });

  afterEach(() => {
    appClientPrivileges.destroy();
    appClientEndpointState.destroy();
    appSourceState.destroy();
  });

  it('Renders', async () => {
    (useAppSourceState as jest.Mock).mockReturnValue(appSourceService);

    appSourceApi.getAvailableAppClients = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientSummaryDto[]>>(resolve => resolve({
        data: allClients,
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });

    const page = render(
      <AppSourceEndpointEditor
        appClientPrivileges={appClientPrivileges}
        endpoint={appClientEndpointState}
      />
    );

    await expect(page.findByTestId('app-source-endpoint-editor')).resolves.toBeInTheDocument();
    await expect(page.findByDisplayValue(appClientEndpointState.get().path)).resolves.toBeInTheDocument();
  });

  it('should handle check and uncheck', async () => {
    (useAppSourceState as jest.Mock).mockReturnValue(appSourceService);

    appSourceApi.getAvailableAppClients = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientSummaryDto[]>>(resolve => resolve({
        data: allClients,
        status: 200,
        headers: {},
        config: {},
        statusText: 'OK'
      }));
    });

    const page = render(
      <AppSourceEndpointEditor
        appClientPrivileges={appClientPrivileges}
        endpoint={appClientEndpointState}
      />
    );

    await waitFor(() => expect(page.getByTestId('checkbox-cell-renderer')).toBeInTheDocument());

    const cellRenderer = page.getByTestId('checkbox-cell-renderer');
    const withinCellRenderer = within(cellRenderer);

    const checkbox = withinCellRenderer.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox!);
    await waitFor(() => expect(checkbox).not.toBeChecked());

    fireEvent.click(checkbox!);
    await waitFor(() => expect(checkbox).toBeChecked());
  });
});
