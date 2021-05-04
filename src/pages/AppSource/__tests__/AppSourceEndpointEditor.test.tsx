import React from 'react';
import { fireEvent, render, within } from '@testing-library/react';
import { AppClientSummaryDto, AppClientUserPrivDto, AppEndpointDto, AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDto } from '../../../openapi';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import AppSourceEndpointEditor from '../AppSourceEndpointEditor';
import { AxiosResponse } from 'axios';
import AppSourceService from '../../../state/app-source/app-source-service';
import { useAppSourceState } from '../../../state/app-source/app-source-state';

jest.mock('../../../state/app-source/app-source-state');

describe('Test App Source Endpoint Editor', () => {
  let appClientPrivileges: State<AppClientUserPrivDto[]> & StateMethodsDestroy;
  let appClientEndpointState: State<AppEndpointDto[]> & StateMethodsDestroy;
  let appSourceIdState: State<string> & StateMethodsDestroy;
  let allClients: AppClientSummaryDto[];
  let appSourceState: State<AppSourceDto[]> & StateMethodsDestroy;
  let appSourceApi: AppSourceControllerApiInterface;
  let appSourceService: AppSourceService;

  beforeEach(() => {
    appSourceState = createState<AppSourceDto[]>(new Array<AppSourceDto>());
    appSourceApi = new AppSourceControllerApi();
    appSourceService = new AppSourceService(appSourceState, appSourceApi);

    appClientEndpointState = createState<AppEndpointDto[]>([
      {
        id: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
        path: '/training-svc/training-program',
        requestType: 'GET'
      },
      {
        id: 'pp05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
        path: '/training-svc/profile-assignment',
        requestType: 'GET'
      }
    ]);

    appSourceIdState = createState<string>('fa63c630-98af-4943-9f55-e8f9d2cb0cba');

    allClients = [
      {
        id: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd1',
        name: 'App Client 1',
      },
      {
        id: 'bb05272f-aeb8-4c58-89a8-e5c0b2f48dd1',
        name: 'App Client 2',
      }
    ];

    appClientPrivileges = createState<AppClientUserPrivDto[]>([
      {
        id: '77fbfe12-691c-4fce-be83-6065163c8267',
        appClientUser: allClients[0].id!,
        appClientUserName: allClients[0].name!,
        appEndpoint: appClientEndpointState[0].id.get()!,
      },
      {
        id: '66fbfe12-691c-4fce-be83-6065163c8267',
        appClientUser: allClients[1].id!,
        appClientUserName: allClients[1].name!,
        appEndpoint: appClientEndpointState[0].id.get()!,
      },
      {
        id: '11fbfe12-691c-4fce-be83-6065163c8267',
        appClientUser: allClients[1].id!,
        appClientUserName: allClients[1].name!,
        appEndpoint: appClientEndpointState[1].id.get()!,
      },
    ]);
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
        selectedEndpoints={appClientEndpointState}
        appSourceId={appSourceIdState}
      />
    );

    await expect(page.findByTestId('app-source-endpoint-editor')).resolves.toBeInTheDocument();
    await expect(page.findByDisplayValue(`${appClientEndpointState[0].get().path}...(and 1 others)`)).resolves.toBeInTheDocument();
  });

  it('it should call checkbox onChange handler', async () => {
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
        selectedEndpoints={appClientEndpointState}
        appSourceId={appSourceIdState}
      />
    );

    await expect(page.findByTestId('app-source-endpoint-editor')).resolves.toBeInTheDocument();
    await expect(page.findByDisplayValue(`${appClientEndpointState[0].get().path}...(and 1 others)`)).resolves.toBeInTheDocument();

    // find both app clients
    expect(page.getByText(allClients[0].name!)).toBeInTheDocument();
    expect(page.getByText(allClients[1].name!)).toBeInTheDocument();

    const appClientCheckboxParent = await page.findAllByTestId('checkbox-cell-renderer');

    // App Client 1
    const appClient1Checkbox = within(appClientCheckboxParent[0]).getByRole('checkbox');
    expect(appClient1Checkbox).toBeInTheDocument();
    expect(appClient1Checkbox).not.toBeChecked();

    // check
    fireEvent.click(appClient1Checkbox!);
    expect(appClientPrivileges.length).toBe(4);
    expect(appClient1Checkbox).toBeChecked();

    // Uncheck
    fireEvent.click(appClient1Checkbox!);
    expect(appClientPrivileges.length).toBe(2);
    expect(appClient1Checkbox).not.toBeChecked();

    // App Client 2
    const appClient2Checkbox = within(appClientCheckboxParent[1]).getByRole('checkbox');
    expect(appClient2Checkbox).toBeInTheDocument();
    expect(appClient2Checkbox).toBeChecked();

    // uncheck
    fireEvent.click(appClient2Checkbox!);
    expect(appClientPrivileges.length).toBe(0);
    expect(appClient2Checkbox).not.toBeChecked();

    // check
    fireEvent.click(appClient2Checkbox!);
    expect(appClientPrivileges.length).toBe(2);
    expect(appClient2Checkbox).toBeChecked();
  });
});
