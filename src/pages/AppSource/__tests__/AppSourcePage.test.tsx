import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { AppSourceControllerApi, AppSourceControllerApiInterface, AppSourceDto } from '../../../openapi';
import { AppSourcePage } from '../AppSourcePage';
import AppSourceService from '../../../state/app-source/app-source-service';
import { useAppSourceState } from '../../../state/app-source/app-source-state';

jest.mock('../../../state/app-source/app-source-state');

describe('Test App Source Page', () => {
  let appSourceState: State<AppSourceDto[]> & StateMethodsDestroy;
  let appSourceApi: AppSourceControllerApiInterface;

  beforeEach(() => {
    appSourceState = createState<AppSourceDto[]>(new Array<AppSourceDto>());
    appSourceApi = new AppSourceControllerApi();
  });

  it('Test Loading Page', async () => {
    function mockAppSourceState() {
      (useAppSourceState as jest.Mock).mockReturnValue(new AppSourceService(appSourceState, appSourceApi));

      jest.spyOn(useAppSourceState(), 'isPromised', 'get').mockReturnValue(true);
    }

    mockAppSourceState();

    const page = render(
      <MemoryRouter>
        <AppSourcePage />
      </MemoryRouter>
    );

    expect(page.getByText('Loading...')).toBeDefined();
  });

  it('should swap to metrics page from data grid', async () => {  
    appSourceState = createState<AppSourceDto[]>([{
      id: '123',
      name: 'source1',
      endpointCount: 1,
      clientCount: 1
    }]);
    function mockAppSourceState() {
      (useAppSourceState as jest.Mock).mockReturnValue(new AppSourceService(appSourceState, appSourceApi));

      jest.spyOn(useAppSourceState(), 'isPromised', 'get').mockReturnValue(false);
    }

    mockAppSourceState();

    const page = render(
      <MemoryRouter>
        <AppSourcePage />
      </MemoryRouter>
    );

    const metricBtn = (await page.findByTitle('metric')).closest('button');
    expect(metricBtn).toBeDefined();
    fireEvent.click(metricBtn!);

    await waitFor(
      () => expect(metricBtn).not.toBeInTheDocument()
    );

    expect(page.getByText('Requests By Endpoint in the last 30 days')).toBeDefined();
    expect(page.getByText('Requests By App Client in the last 30 days')).toBeDefined();
  });
})
