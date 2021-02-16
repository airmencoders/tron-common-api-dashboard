import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AppClientForm from '../AppClientForm';
import { AppClientFormActionType } from '../AppClientFormActionType';
import { AppClientFormActionSuccess } from '../AppClientFormActionSuccess';
import { AppClientFlat } from '../../../state/app-clients/interface/app-client-flat';
import { AppClientFormError } from '../AppClientFormError';

describe('Test App Client Form', () => {
  let onSubmit = jest.fn();
  let successAction: AppClientFormActionSuccess;
  let client: AppClientFlat;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation((event) => {
      event.preventDefault();
    });

    successAction = {
      success: false,
      successMsg: ''
    };

    client = {
      name: 'test',
      read: false,
      write: false
    };
  });

  it('Update', async () => {
    const pageRender = render(
      <AppClientForm client={client} onSubmit={onSubmit} type={AppClientFormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
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

    fireEvent.click(pageRender.getByText(/Update/i));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Update no client', async () => {
    const pageRender = render(
      <AppClientForm onSubmit={onSubmit} type={AppClientFormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    expect(pageRender.getByText('There was an error loading client details...'));
  });

  it('Submitting', async () => {
    const pageRender = render(
      <AppClientForm client={client} onSubmit={onSubmit} type={AppClientFormActionType.UPDATE} isSubmitting={true} successAction={successAction} />
    );

    expect(pageRender.getByText('Submitting...'));
  });

  it('Client-side Validation', () => {
    const pageRender = render(
      <AppClientForm client={client} onSubmit={onSubmit} type={AppClientFormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    const nameInput = pageRender.getByDisplayValue(client.name);
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(pageRender.getByDisplayValue('')).toBeInTheDocument();
    expect(pageRender.getByText('* cannot be empty or blank.'));
  });

  it('Server-side Validation', () => {
    const nameValidation: string = 'name validation';
    const generalError: string = 'some error';
    const errors: AppClientFormError = {
      validation: {
        name: nameValidation
      },
      general: generalError
    };

    const pageRender = render(
      <AppClientForm errors={errors} client={client} onSubmit={onSubmit} type={AppClientFormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    expect(pageRender.getByText('* ' + nameValidation));
    expect(pageRender.getByText('* ' + generalError));
  });

  it('Success message', () => {
    successAction.success = true;
    successAction.successMsg = 'Success message';

    const pageRender = render(
      <AppClientForm client={client} onSubmit={onSubmit} type={AppClientFormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    expect(pageRender.getByText(successAction.successMsg));
  });
})
