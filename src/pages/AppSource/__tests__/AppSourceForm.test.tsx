import React from 'react';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppSourceForm from '../AppSourceForm';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { AppSourceDetailsDto } from '../../../openapi';
import { validationErrors } from '../../../utils/validation-utils';

describe('Test App Source Form', () => {
  jest.setTimeout(10000);
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
      reportStatus: true,
      healthUrl: "/api/health",
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
          deleted: true,
          path: 'endpoint_path',
          requestType: 'GET'
        }
      ],
      throttleEnabled: false,
      throttleRequestCount: 0
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

    // Set name
    const nameInput = page.getByDisplayValue(appSourceDetailsDto.name);

    fireEvent.change(nameInput, { target: { value: 'Test 2' } });
    expect(nameInput).toHaveValue('Test 2');

    // Set email
    const adminEmailInput = page.getByLabelText('Admins');

    const adminEmailTest = 'email@test.com';
    fireEvent.change(adminEmailInput, { target: { value: adminEmailTest } });
    expect(adminEmailInput).toHaveValue(adminEmailTest);

    // Add admin email
    const addAdminBtn = page.getByText('Add Admin');
    fireEvent.click(addAdminBtn);

    await expect(page.findByText(adminEmailTest)).resolves.toBeInTheDocument();
    const adminEmailElement = page.getByText(adminEmailTest);
    const waitForAdminEmailRemoval = waitForElementToBeRemoved(adminEmailElement);
    // Remove admin email
    const removeBtn = await page.findByTitle('remove');
    fireEvent.click(removeBtn);

    await waitForAdminEmailRemoval;

    // Change Rate Limit
    const rateLimitToggle = page.getByLabelText('Enable Rate Limiting');
    const rateLimit = page.getByLabelText('Rate Limit');
    expect(rateLimitToggle).not.toBeChecked();
    expect(rateLimit).toBeDisabled();
    fireEvent.click(rateLimitToggle);
    expect(page.getByLabelText('Enable Rate Limiting')).toBeChecked();
    expect(page.getByLabelText('Rate Limit')).not.toBeDisabled();

    fireEvent.change(rateLimit, { target: { value: '123' } });
    expect(rateLimit).toHaveValue('123');

    fireEvent.click(page.getByText('Update'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should open endpoint editor modal when clicking an endpoint to edit', async () => {
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

    // Click an endpoint to edit
    await (expect(page.findByText('endpoint_path', {}, { timeout: 10000 }))).resolves.toBeInTheDocument();
    fireEvent.click(page.getByText('endpoint_path'));

    await (expect(page.findByText('Endpoint Editor'))).resolves.toBeInTheDocument();
  });

  it('test name client side validation', () => {
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

    fireEvent.change(nameInput, { target: { value: 'asdf' } });
    expect(nameInput).toHaveValue('asdf');
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(nameInput).toHaveValue('');
    expect(page.getByText(new RegExp(validationErrors.requiredText)));
  });

  it('test admin client side validation', () => {
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

    // Client-side validation on Admin Email
    const adminEmailInput = page.getByLabelText('Admins');

    fireEvent.change(adminEmailInput, { target: { value: 'bad_email' } });
    expect(adminEmailInput).toHaveValue('bad_email');
    expect(page.getByText(new RegExp(validationErrors.invalidEmail)));
  });

  it('test rate limit client side validation', () => {
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

    // Change Rate Limit
    const rateLimitToggle = page.getByLabelText('Enable Rate Limiting');
    const rateLimit = page.getByLabelText('Rate Limit');
    expect(rateLimitToggle).not.toBeChecked();
    expect(rateLimit).toBeDisabled();
    fireEvent.click(rateLimitToggle);
    expect(page.getByLabelText('Enable Rate Limiting')).toBeChecked();
    expect(page.getByLabelText('Rate Limit')).not.toBeDisabled();

    // Try typing a non-number, should not accept it
    fireEvent.keyPress(rateLimit, { key: 'a', code: 'KeyA' });
    expect(rateLimit).toHaveValue('0');

    // Try an empty value
    fireEvent.change(rateLimit, { target: { value: '' } });
    expect(rateLimit).toHaveValue('');
  });

  it('should delete endpoint and send update to server', async () => {
    successAction = undefined;
    appSourceDetailsDto.endpoints![0].deleted = true;
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

    // Click the button to delete endpoint
    await (expect(page.findByTestId('unused-true', {}, { timeout: 10000 }))).resolves.toBeInTheDocument();
    const deleteEndpointBtn = page.getByTestId('unused-true');
    fireEvent.click(deleteEndpointBtn);

    await (expect(page.findByText('Delete Confirmation'))).resolves.toBeInTheDocument();

    // Close delete confirmation modal
    const xCloseBtn = (await (screen.findByTitle('close-modal')));
    expect(xCloseBtn).toBeInTheDocument();
    expect(xCloseBtn?.classList.contains('close-btn')).toBeTruthy();
    fireEvent.click(xCloseBtn!);

    // Click the button to delete endpoint
    fireEvent.click(deleteEndpointBtn);

    await (expect(page.findByText('Delete Confirmation'))).resolves.toBeInTheDocument();

    // Click the button to close delete confirmation modal
    const closeBtn = (screen.getAllByText('Cancel')).find(element => element.getAttribute('type') === 'button');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn!);

    // Click the button to delete endpoint
    fireEvent.click(deleteEndpointBtn);

    await (expect(page.findByText('Delete Confirmation'))).resolves.toBeInTheDocument();

    // Click the delete button to confirm deleting endpoint
    const deleteBtn = (screen.getAllByText('Delete')).find(element => element.getAttribute('type') === 'submit');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn!);

    await (expect(page.findByText('Update'))).resolves.toBeInTheDocument();
    fireEvent.click(page.getByText('Update'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
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
  });
});
