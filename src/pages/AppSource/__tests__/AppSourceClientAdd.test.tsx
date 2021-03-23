import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import AppSourceClientAdd from '../AppSourceClientAdd';
import { AppClientUserPrivFlat } from '../../../state/app-source/app-client-user-priv-flat';
import { accessAppClientsState } from '../../../state/app-clients/app-clients-state';
import { AppClientFlat } from '../../../state/app-clients/app-client-flat';

jest.mock('../../../state/app-source/app-source-state');

describe('Test App Source Client Add', () => {
  let dataState: State<AppClientUserPrivFlat[]> & StateMethodsDestroy;

  const appClient: AppClientFlat = {
    id: 'some id',
    name: 'App Client 1',
    read: true,
    write: true
  };

  beforeEach(() => {
    dataState = createState<AppClientUserPrivFlat[]>([]);

    accessAppClientsState().state.set([appClient]);
  });

  afterEach(() => {
    dataState.destroy();
  })

  it('Test Renders', async () => {
    const page = render(
      <MemoryRouter>
        <AppSourceClientAdd data={dataState} />
      </MemoryRouter>
    );

    expect(page.getByTestId('app-source-client-add')).toBeDefined();
  });

  it('App Clients load in', async () => {
    const page = render(
      <MemoryRouter>
        <AppSourceClientAdd data={dataState} />
      </MemoryRouter>
    );

    expect(page.getByText(appClient.name)).toBeDefined();
  });

  it('Click App Client', async () => {
    const page = render(
      <MemoryRouter>
        <AppSourceClientAdd data={dataState} />
      </MemoryRouter>
    );

    const row = page.getByText(appClient.name);
    expect(row).toBeDefined();
    fireEvent.click(row);


    const readPrivilege = page.getByLabelText('Read');
    fireEvent.click(readPrivilege);
    expect(readPrivilege).toBeChecked();

    const writePrivilege = page.getByLabelText('Write');
    fireEvent.click(writePrivilege);
    expect(writePrivilege).toBeChecked();

    await waitFor(
      () => {
        expect(page.getByDisplayValue(appClient.id!)).toBeInTheDocument();
        expect(page.getByDisplayValue(appClient.name)).toBeInTheDocument();
      }
    );

    const addClientBtn = page.getByText('Add Client');
    fireEvent.click(addClientBtn);

    await waitFor(
      () => {
        expect(page.getByLabelText('UUID')).toHaveValue('');
        expect(page.getByLabelText('Name')).toHaveValue('');
      }
    );

    expect(dataState.find(item => item.appClientUser.get() === appClient.id)).toBeDefined();
  });

  it('Click App Client misc', async () => {
    // Give state a bad value
    accessAppClientsState().state.set([{ ...appClient, id: undefined }]);

    const page = render(
      <MemoryRouter>
        <AppSourceClientAdd data={dataState} />
      </MemoryRouter>
    );

    const row = page.getByText(appClient.name);
    expect(row).toBeDefined();
    fireEvent.click(row);


    const readPrivilege = page.getByLabelText('Read');
    fireEvent.click(readPrivilege);
    expect(readPrivilege).toBeChecked();

    await waitFor(
      () => {
        expect(page.getByDisplayValue(appClient.name)).toBeInTheDocument();
      }
    );

    const addClientBtn = page.getByText('Add Client');
    fireEvent.click(addClientBtn);

    await waitFor(
      () => {
        expect(page.getByLabelText('UUID')).toHaveValue('');
        expect(page.getByLabelText('Name')).toHaveValue('');
      }
    );

    expect(dataState.find(item => item.appClientUserName.get() === appClient.name)).toBeDefined();
  });

  it('App Client list does not contain client that is already authorized for app source', async () => {
    dataState[dataState.length].set({
      appClientUser: appClient.id!,
      appClientUserName: appClient.name,
      read: false,
      write: false
    });

    const page = render(
      <MemoryRouter>
        <AppSourceClientAdd data={dataState} />
      </MemoryRouter>
    );

    expect(page.queryByText(appClient.name)).not.toBeInTheDocument();
  });
})
