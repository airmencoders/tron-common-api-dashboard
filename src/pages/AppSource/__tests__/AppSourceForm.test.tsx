import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppSourceForm from '../AppSourceForm';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { AppSourceDetailsDto } from '../../../openapi';

describe('Test App Source Form', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let successAction: DataCrudSuccessAction | undefined;
  let appSourceDetailsDto: AppSourceDetailsDto;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    successAction = {
      success: false,
      successMsg: ''
    };

    appSourceDetailsDto = {
      id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
      name: 'test',
      appClients: [
        {
          appClientUser: 'App Client User ID',
          appClientUserName: 'App Client Name',
          appEndpoint: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
        }
      ],
      appSourceAdminUserEmails: [
        'test@email.com'
      ],
      endpoints: [
        {
          id: 'ee05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
          path: 'endpoint_path',
          requestType: 'GET'
        }
      ]
    };
  });

  it('Update', async () => {
    successAction = undefined;

    const page = render(
      <MemoryRouter>
        <AppSourceForm
          onSubmit={onSubmit}
          onClose={onClose}
          formActionType={FormActionType.UPDATE}
          isSubmitting={false}
          successAction={successAction}
          data={appSourceDetailsDto}
        />
      </MemoryRouter>
    );

    const elem = page.getByTestId('app-source-form');
    expect(elem).toBeInTheDocument();

    // Test client-side validation on Name
    const nameInput = page.getByDisplayValue(appSourceDetailsDto.name);

    fireEvent.change(nameInput, { target: { value: '' } });
    expect(nameInput).toHaveValue('');
    expect(page.getByText(/cannot be empty or blank/i));

    fireEvent.change(nameInput, { target: { value: 'Test 2' } });
    expect(nameInput).toHaveValue('Test 2');

    // Client-side validation on Admin Email
    const adminEmailInput = page.getByLabelText('Admins');

    fireEvent.change(adminEmailInput, { target: { value: 'bad_email' } });
    expect(adminEmailInput).toHaveValue('bad_email');
    expect(page.getByText(/enter valid email/i));

    const adminEmailTest = 'email@test.com';
    fireEvent.change(adminEmailInput, { target: { value: adminEmailTest } });
    expect(adminEmailInput).toHaveValue(adminEmailTest);

    // Add admin email
    const addAdminBtn = page.getByText('Add Admin');
    fireEvent.click(addAdminBtn);

    await expect(page.findByText(adminEmailTest)).resolves.toBeInTheDocument();

    // Remove admin email
    const removeBtn = await page.findByTitle('remove');
    fireEvent.click(removeBtn);

    await expect(page.findByText(adminEmailTest)).rejects.toThrow();

    fireEvent.click(page.getByText('Update'));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // Click an endpoint to edit
    await (expect(page.findByText('endpoint_path'))).resolves.toBeInTheDocument();
    fireEvent.click(page.getByText('endpoint_path'));

    await (expect(page.findByText('Endpoint Editor'))).resolves.toBeInTheDocument();

    const closeBtn = (await (screen.findByTitle('close-modal')));
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn?.classList.contains('close-btn')).toBeTruthy();
    fireEvent.click(closeBtn!);
  });

  it('Has default values if none given', () => {
    successAction = undefined;

    appSourceDetailsDto.id = undefined;
    appSourceDetailsDto.appClients = undefined;
    appSourceDetailsDto.appSourceAdminUserEmails = undefined;
    appSourceDetailsDto.endpoints = undefined;

    const page = render(
      <MemoryRouter>
        <AppSourceForm
          onSubmit={onSubmit}
          onClose={onClose}
          formActionType={FormActionType.UPDATE}
          isSubmitting={false}
          successAction={successAction}
          data={appSourceDetailsDto}
        />
      </MemoryRouter>
    );

    expect(page.getByTestId('app-source-form')).toBeInTheDocument();
  });

  it('Shows success', () => {
    successAction = {
      success: true,
      successMsg: 'Success'
    };

    const page = render(
      <MemoryRouter>
        <AppSourceForm
          onSubmit={onSubmit}
          onClose={onClose}
          formActionType={FormActionType.UPDATE}
          isSubmitting={false}
          successAction={successAction}
          data={appSourceDetailsDto}
        />
      </MemoryRouter>
    );

    expect(page.getByText(successAction.successMsg)).toBeInTheDocument();
  })

});
