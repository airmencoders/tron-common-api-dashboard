import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import AppSourceEndpointInfo from '../AppSourceEndpointInfo';
import {AppSourceDevDetails} from '../../../state/app-source/app-source-dev-details';
import {AppEndpointClientInfoDto, AppEndpointClientInfoDtoMethodEnum} from '../../../openapi/models';
import { MemoryRouter } from 'react-router-dom';

test('App Source Endpoint Info', async () => {
  const mockAppSourceDevDetails = new AppSourceDevDetails('sourceId', 'Mock App');
  mockAppSourceDevDetails.allowedEndpoints.push({
    id: '0',
    appSourceName: 'App Source',
    path: '/path-1',
    basePath: 'http://localhost/mock',
    method: AppEndpointClientInfoDtoMethodEnum.Get,
    deleted: false,
    appSourceId: 'appSourceId'
  } as AppEndpointClientInfoDto)
  render(
      <MemoryRouter>
        <AppSourceEndpointInfo appSourceDevDetails={mockAppSourceDevDetails} isOpened={false} />
      </MemoryRouter>
      );
  await waitFor(
      () => expect(screen.getByText('http://localhost/mock')).toBeTruthy()
  );
});
