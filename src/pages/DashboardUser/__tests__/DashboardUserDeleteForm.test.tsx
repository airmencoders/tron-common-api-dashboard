import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DashboardUserFlat } from '../../../state/dashboard-user/dashboard-user-flat';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';
import DashboardUserDeleteForm from '../DashboardUserDeleteForm';

describe('Test Dashboard Delete User Form', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let successAction: DataCrudSuccessAction | undefined;
  let data: DashboardUserFlat;
  let formErrors: DataCrudFormErrors;

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

    successAction = {
      success: false,
      successMsg: ''
    };

    formErrors = {
      validation: undefined,
      general: undefined
    }
  });

  it('Delete', async () => {
    successAction = undefined;
    const pageRender = render(
      <DashboardUserDeleteForm
        data={data}
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
      />
    );

    expect(pageRender.getByTestId('dashboard-user-delete-form')).toBeInTheDocument();

    fireEvent.click(pageRender.getByText('Delete'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Success message', () => {
    successAction = {
      success: true,
      successMsg: 'Success message'
    };

    const pageRender = render(
      <DashboardUserDeleteForm
        data={data}
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
      />
    );

    expect(pageRender.getByText(successAction.successMsg));
  });
})
