import React from 'react';
import HeaderUserInfo from '../HeaderUserInfo';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
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

test('click shows userInfo dropdown', async () => {
  const userInfo: UserInfoDto = {
    givenName: 'Test',
    familyName: 'User',
    name: 'Test User'
  }
  debugger;
  render(<HeaderUserInfo userInfo={userInfo} />);
  const dropdownToggle = screen.getByText('TU');
  fireEvent.click(dropdownToggle);

  await waitFor(() => {
    expect(screen.getByText('Test User')).toBeTruthy()
  })
});
