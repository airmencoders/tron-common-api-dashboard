import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AppClientForm from '../AppClientForm';
import { AppClientFlat } from '../../../state/app-clients/interface/app-client-flat';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';

describe('Test App Client Form', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let successAction: DataCrudSuccessAction | undefined;
  let client: AppClientFlat;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    successAction = {
      success: false,
      successMsg: ''
    };

    client = {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: 'test',
      read: false,
      write: false
    };
  });

  it('Update', async () => {
    successAction = undefined;

    const pageRender = render(
      <AppClientForm onClose={onClose} data={client} onSubmit={onSubmit} formActionType={FormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    const nameInput = pageRender.getByDisplayValue(client.name);
    fireEvent.change(nameInput, { target: { value: 'Test 2' } });
    expect(nameInput).toHaveValue('Test 2');

    const writeCheckbox = pageRender.getByLabelText('Write');
    fireEvent.click(writeCheckbox);
    expect(writeCheckbox).toBeChecked();

    const readCheckbox = pageRender.getByLabelText('Read');
    fireEvent.click(readCheckbox);
    expect(readCheckbox).toBeChecked();

    fireEvent.click(pageRender.getByText('Update'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Update - no app client', async () => {
    const pageRender = render(
      <AppClientForm onSubmit={onSubmit} onClose={onClose} successAction={successAction} isSubmitting={false} formActionType={FormActionType.UPDATE} />
    );

    const nameInput = pageRender.getByLabelText('Name');
    expect(nameInput).toHaveValue('');
  });

  it('Client-side Validation', () => {
    const pageRender = render(
      <AppClientForm onClose={onClose} data={client} onSubmit={onSubmit} formActionType={FormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    const nameInput = pageRender.getByDisplayValue(client.name);
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(nameInput).toHaveValue('');
    expect(pageRender.getByText('* cannot be empty or blank.'));
  });

  it('Server-side Validation', () => {
    // const nameValidation: string = 'name validation';
    const generalError: string = 'some error';
    const errors: DataCrudFormErrors = {
      validation: {
        // name: nameValidation
      },
      general: generalError
    };

    const pageRender = render(
      <AppClientForm onClose={onClose} formErrors={errors} data={client} onSubmit={onSubmit} formActionType={FormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    // expect(pageRender.getByText('* ' + nameValidation));
    expect(pageRender.getByText('* ' + generalError));
  });

  it('Success message', () => {
    successAction = {
      success: true,
      successMsg: 'Success message'
    };

    const pageRender = render(
      <AppClientForm onClose={onClose} data={client} onSubmit={onSubmit} formActionType={FormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    expect(pageRender.getByText(successAction.successMsg));
  });
})
