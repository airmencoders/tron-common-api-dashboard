import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AppClientEdit from '../AppClientEdit';
import { AppClientFlat } from '../../../state/app-clients/interface/app-client-flat';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppClientControllerApi, AppClientControllerApiInterface, AppClientUserDto, Configuration, Privilege } from '../../../openapi';
import Config from '../../../api/configuration';
import { useAppClientsState } from '../../../state/app-clients/app-clients-state';
import AppClientsService from '../../../state/app-clients/app-clients-service';
import { AxiosResponse } from 'axios';
import { PrivilegeType } from '../../../state/app-clients/interface/privilege-type';
import { act } from 'react-dom/test-utils';

jest.mock('../../../state/app-clients/app-clients-state');

describe('App Client Edit', () => {
  let testClientPrivileges: Privilege[];
  let testClientDto: AppClientUserDto;
  let testClientFlat: AppClientFlat;
  let axiosResponse: AxiosResponse;
  let appClientsState: State<AppClientFlat[]> & StateMethodsDestroy;
  let appClientsApi: AppClientControllerApiInterface;

  afterEach(() => {
    appClientsState.destroy();
  })

  beforeEach(() => {
    testClientPrivileges = [
      {
        id: 1,
        name: PrivilegeType.READ
      },
      {
        id: 2,
        name: PrivilegeType.WRITE
      }
    ];

    testClientDto = {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test Client",
      privileges: testClientPrivileges
    };

    testClientFlat = {
      id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
      name: 'Test Client',
      read: true,
      write: true
    };

    axiosResponse = {
      data: testClientDto,
      status: 200,
      statusText: 'OK',
      config: {},
      headers: {}
    };

    appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    appClientsApi = new AppClientControllerApi(new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX }));
  });

  it('Client', async () => {
    const pageRender = render(
      <AppClientEdit client={testClientFlat} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();
  });

  it('No client', async () => {
    const pageRender = render(
      <AppClientEdit />
    );

    const elem = pageRender.getByTestId('app-client-form__no-data');
    expect(elem).toBeInTheDocument();
  });

  it('Submit Update', async () => {
    (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.updateAppClient = jest.fn(() => {
      return new Promise<AxiosResponse<AppClientUserDto>>(resolve => resolve(axiosResponse));
    });

    const pageRender = render(
      <AppClientEdit client={testClientFlat} />
    );

    const writeCheckbox = pageRender.getByLabelText('Write');
    fireEvent.click(writeCheckbox);

    const readCheckbox = pageRender.getByLabelText('Read');
    fireEvent.click(readCheckbox);

    await act(async () => {
      fireEvent.click(pageRender.getByText(/Update/i));
    });

    expect(pageRender.getByText('Successfully edited App Client')).toBeInTheDocument();
  });

  it('Submit Update - error response', async () => {
    const validationDefaultMessage: string = 'name validation';

    (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.updateAppClient = jest.fn().mockRejectedValue({
      response: {
        data: {
          errors: [
            {
              field: 'name',
              defaultMessage: validationDefaultMessage
            }
          ]
        }
      }
    });

    const pageRender = render(
      <AppClientEdit client={testClientFlat} />
    );

    const writeCheckbox = pageRender.getByLabelText('Write');
    fireEvent.click(writeCheckbox);

    await act(async () => {
      fireEvent.click(pageRender.getByText(/Update/i));
    });

    expect(pageRender.getByText('* ' + validationDefaultMessage)).toBeInTheDocument();
  });

  it('Submit Update - error request', async () => {
    (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.updateAppClient = jest.fn().mockRejectedValue({
      request: {

      }
    });

    const pageRender = render(
      <AppClientEdit client={testClientFlat} />
    );

    const writeCheckbox = pageRender.getByLabelText('Write');
    fireEvent.click(writeCheckbox);

    await act(async () => {
      fireEvent.click(pageRender.getByText(/Update/i));
    });

    expect(pageRender.getByText('* Error contacting server. Try again later.')).toBeInTheDocument();
  });

  it('Submit Update - error unknown', async () => {
    (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.updateAppClient = jest.fn().mockRejectedValue({});

    const pageRender = render(
      <AppClientEdit client={testClientFlat} />
    );

    const writeCheckbox = pageRender.getByLabelText('Write');
    fireEvent.click(writeCheckbox);

    await act(async () => {
      fireEvent.click(pageRender.getByText(/Update/i));
    });

    expect(pageRender.getByText('* Internal error occurred. Try again later.')).toBeInTheDocument();
  });
});
