import React from 'react';
import HeaderUserInfo from '../HeaderUserInfo';
import { render, waitFor, screen } from '@testing-library/react';
import {UserInfoDto} from '../../../openapi/models';

test('shows the HeaderUserInfo', async () => {
  const userInfo: UserInfoDto = {
    givenName: 'Test',
    familyName: 'User'
  }
  render(<HeaderUserInfo userInfo={userInfo} />);

  await waitFor(() => {
    expect(screen.getByText('TU')).toBeTruthy()
  })
});
