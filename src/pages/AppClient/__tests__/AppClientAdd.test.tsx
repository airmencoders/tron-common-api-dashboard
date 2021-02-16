import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import AppClientAdd from '../AppClientAdd';
import { createState } from '@hookstate/core';
import { AppClientFlat } from '../../../state/app-clients/interface/app-client-flat';
import { AppClientControllerApi, AppClientControllerApiInterface, AppClientUserDto, Configuration, Privilege } from '../../../openapi';
import Config from '../../../api/configuration';
import { useAppClientsState } from '../../../state/app-clients/app-clients-state';
import AppClientsService from '../../../state/app-clients/app-clients-service';
import axios, { AxiosResponse } from 'axios';
import { PrivilegeType } from '../../../state/app-clients/interface/privilege-type';

jest.mock('../../../state/app-clients/app-clients-state');

describe('App Client Add', () => {
  let testClientPrivileges: Privilege[];
  let testClientDto: AppClientUserDto;
  let testClientFlat: AppClientFlat;
  let axiosResponse: AxiosResponse;

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
  });


  it('Renders form', async () => {
    const pageRender = render(
      <AppClientAdd />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();
  });

  it('Submit Add', async () => {
    const appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    const appClientsApi: AppClientControllerApiInterface = new AppClientControllerApi(
      new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
    );

    (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.createAppClientUser = jest.fn().mockResolvedValue(axiosResponse);

    const pageRender = render(
      <AppClientAdd />
    );

    const nameInput = pageRender.getByPlaceholderText('Enter Client App Name');
    fireEvent.change(nameInput, { target: { value: 'Test 2' } });

    await act(async () => {
      fireEvent.click(pageRender.getByText(/Add/i));
    });

    expect(pageRender.getByText('Successfully added App Client')).toBeInTheDocument();
  });


  it('Submit Add - error response', async () => {
    const appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    const appClientsApi: AppClientControllerApiInterface = new AppClientControllerApi(
      new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
    );

    const validationDefaultMessage: string = 'name validation';

    (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.createAppClientUser = jest.fn().mockRejectedValue({
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
      <AppClientAdd />
    );

    const nameInput = pageRender.getByPlaceholderText('Enter Client App Name');
    fireEvent.change(nameInput, { target: { value: 'Test 2' } });

    await act(async () => {
      fireEvent.click(pageRender.getByText(/Add/i));
    });

    expect(pageRender.getByText('* ' + validationDefaultMessage)).toBeInTheDocument();
  });


  it('Submit Add - error request', async () => {
    const appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    const appClientsApi: AppClientControllerApiInterface = new AppClientControllerApi(
      new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
    );

    (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.createAppClientUser = jest.fn().mockRejectedValue({
      request: {

      }
    });

    const pageRender = render(
      <AppClientAdd />
    );

    const nameInput = pageRender.getByPlaceholderText('Enter Client App Name');
    fireEvent.change(nameInput, { target: { value: 'Test 2' } });

    await act(async () => {
      fireEvent.click(pageRender.getByText(/Add/i));
    });

    expect(pageRender.getByText('* Error contacting server. Try again later.')).toBeInTheDocument();
  });


  it('Submit Add - error unknown', async () => {
    const appClientsState = createState<AppClientFlat[]>(new Array<AppClientFlat>());
    const appClientsApi: AppClientControllerApiInterface = new AppClientControllerApi(
      new Configuration({ basePath: Config.API_BASE_URL + Config.API_PATH_PREFIX })
    );

    (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientsState, appClientsApi));
    appClientsApi.createAppClientUser = jest.fn().mockRejectedValue({});

    const pageRender = render(
      <AppClientAdd />
    );

    const nameInput = pageRender.getByPlaceholderText('Enter Client App Name');
    fireEvent.change(nameInput, { target: { value: 'Test 2' } });

    await act(async () => {
      fireEvent.click(pageRender.getByText(/Add/i));
    });

    expect(pageRender.getByText('* Internal error occurred. Try again later.')).toBeInTheDocument();
  });

});
