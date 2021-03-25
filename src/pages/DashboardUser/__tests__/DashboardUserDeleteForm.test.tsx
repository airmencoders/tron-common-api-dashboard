import React from 'react';
import { render } from '@testing-library/react';
import { DashboardUserFlat } from '../../../state/dashboard-user/dashboard-user-flat';
import DashboardUserDelete from '../DashboardUserDelete';

describe('Test Dashboard Delete User Form', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let data: DashboardUserFlat;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    data = {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      email: "test@email.com",
      hasDashboardAdmin: false,
      hasDashboardUser: false
    }
  });

  it('Renders', () => {
    const pageRender = render(
      <DashboardUserDelete
        data={data}
        dataTypeName="Dashboard User"
      />
    );

    expect(pageRender.getByTestId('data-crud-delete-content')).toBeInTheDocument();
    expect(pageRender.getByText(data.id!)).toBeInTheDocument();
    expect(pageRender.getByText(data.email!)).toBeInTheDocument();
  });
})
