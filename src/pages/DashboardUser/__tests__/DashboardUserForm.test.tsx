import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DashboardUserForm from '../DashboardUserForm';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { DashboardUserFlat } from '../../../state/dashboard-user/dashboard-user-flat';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';
import { validationErrors } from '../../../utils/validation-utils';

describe('Test Dashboard User Form', () => {
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

  it('Update', async () => {
    successAction = undefined;
    const pageRender = render(
      <DashboardUserForm
        data={data}
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
      />
    );

    const elem = pageRender.getByTestId('dashboard-user-form');
    expect(elem).toBeInTheDocument();

    const emailInput = pageRender.getByDisplayValue(data.email);
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    expect(emailInput).toHaveValue('test@email.com');

    const adminCheckbox = pageRender.getByLabelText('Dashboard Admin');
    fireEvent.click(adminCheckbox);
    expect(adminCheckbox).toBeChecked();

    const userCheckbox = pageRender.getByLabelText('Dashboard User');
    fireEvent.click(userCheckbox);
    expect(userCheckbox).toBeChecked();

    fireEvent.click(pageRender.getByText(/Update/i));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Update no client', async () => {
    const pageRender = render(
      <DashboardUserForm
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
      />
    );

    const emailInput = pageRender.getByLabelText('Email');
    expect(emailInput).toHaveValue('');
  });

  it('Client-side Validation', () => {
    const newData = {
      ...data,
      hasDashboardAdmin: true,
      hasDashboardUser: true
    }

    const pageRender = render(
      <DashboardUserForm
        data={newData}
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
      />
    );

    const elem = pageRender.getByTestId('dashboard-user-form');
    expect(elem).toBeInTheDocument();

    const emailInput = pageRender.getByDisplayValue(data.email);
    fireEvent.change(emailInput, { target: { value: 'test' } });
    expect(emailInput).toHaveValue('test');
    expect(pageRender.getByText(new RegExp(validationErrors.invalidEmail)));


    const adminCheckbox = pageRender.getByLabelText('Dashboard Admin');
    fireEvent.click(adminCheckbox);
    expect(adminCheckbox).not.toBeChecked();

    const userCheckbox = pageRender.getByLabelText('Dashboard User');
    fireEvent.click(userCheckbox);
    expect(userCheckbox).not.toBeChecked();

    expect(pageRender.getByText(new RegExp(validationErrors.atLeastOnePrivilege)));
  });

  it('Success message', () => {
    successAction = {
      success: true,
      successMsg: 'Success message'
    };

    const pageRender = render(
      <DashboardUserForm
        data={data}
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
      />
    );

    const elem = pageRender.getByTestId('dashboard-user-form');
    expect(elem).toBeInTheDocument();

    expect(pageRender.getByText(successAction.successMsg));
  });
})
