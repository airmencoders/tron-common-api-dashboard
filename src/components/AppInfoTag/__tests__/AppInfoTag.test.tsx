import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { AppVersionControllerApi, AppVersionInfoDto } from '../../../openapi';
import AppInfoService from '../../../state/app-info/app-info-service';
import { useAppVersionState } from '../../../state/app-info/app-info-state';
import AppInfoTag from '../AppInfoTag';

jest.mock('../../../state/app-info/app-info-state');

describe('App Info Tag Tests', () => {
  let appInfoState: State<AppVersionInfoDto> & StateMethodsDestroy;
  let appInfoApi: AppVersionControllerApi;
  const resp: AppVersionInfoDto = { enclave: 'IL2', environment: 'staging', version: 'dsfsdf' };

  beforeEach(() => {
    appInfoState = createState<AppVersionInfoDto>(resp);
    appInfoApi = new AppVersionControllerApi();
    (useAppVersionState as jest.Mock).mockReturnValue(new AppInfoService(appInfoState, appInfoApi));
    appInfoApi.getVersion = jest.fn(() => {
      return Promise.resolve({
        data: resp,
        status: 200,
        statusText: 'OK',
        config: {},
        headers: {}
      });
    });
  })

  it('renders', async () => {
    const page = render(<AppInfoTag />);

    await waitFor(() => expect(page.getByTestId('tag')).toBeVisible());
    await waitFor(() => expect(page.getByText('IL2 STAGING')).toBeVisible());
  });
});