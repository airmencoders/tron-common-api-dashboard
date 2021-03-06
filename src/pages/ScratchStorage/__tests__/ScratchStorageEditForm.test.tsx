import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { ScratchStorageFlat } from '../../../state/scratch-storage/scratch-storage-flat';
import { validationErrors } from '../../../utils/validation-utils';
import ScratchStorageEditForm from '../ScratchStorageEditForm';

describe('Test Scratch Storage Edit Form', () => {
let onSubmit = jest.fn();
let onClose = jest.fn();
let successAction: DataCrudSuccessAction | undefined;
let testScratchStorage: ScratchStorageFlat;
let testValidScratchStorage: ScratchStorageFlat;
let testValidScratchStorageWithKeys: ScratchStorageFlat;

beforeEach(() => {
    testScratchStorage = {
        id: '',
        appName: '',
        userPrivs: [],
        keyNames: [],
        aclMode: false,
    };

    testValidScratchStorage = {
        id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
        appName: 'Test App Name',
        appHasImplicitRead: false,
        userPrivs: [
            {
                userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                email: 'test@test.com',
                read: false,
                write: false,
                admin: false
            }
        ],
        keyNames: [],
        aclMode: false,
    };

    testValidScratchStorage = {
      id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
      appName: 'Test App Name',
      appHasImplicitRead: false,
      userPrivs: [
          {
              userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              email: 'test@test.com',
              read: false,
              write: false,
              admin: false
          }
      ],
      keyNames: ['some-key'],
      aclMode: false,
  };
});

it('should render', async () => {

    const form = render(
        <ScratchStorageEditForm
            data={testScratchStorage}
            formErrors={{}}
            onSubmit={() => {}}
            onClose={() => {}}
            successAction={{
              success: false,
              successMsg: ''
            }}
            isSubmitting={false}
            formActionType={FormActionType.ADD}
        />
    );
    await waitFor(
        () => expect(form.getByText('App Name')).toBeTruthy()
    );
  });

  it('should not allow submit if app name is not set', async () => {
    const form = render(
        <ScratchStorageEditForm
            data={testScratchStorage}
            formErrors={{}}
            onSubmit={() => {}}
            onClose={() => {}}
            isSubmitting={false}
            formActionType={FormActionType.ADD}
        />
    );
    await waitFor(
        () => expect(form.getByText('Add').closest('button'))
            .toHaveAttribute('disabled')
    );
  });

  it('should allow submit if form is modified', async () => {
    const form = render(
        <ScratchStorageEditForm
            data={testValidScratchStorage}
            formErrors={{}}
            onSubmit={() => {}}
            onClose={() => {}}
            isSubmitting={false}
            formActionType={FormActionType.ADD}
        />
    );

    const appNameInput = await form.getByLabelText('App Name', {selector: 'input'});
    fireEvent.change(appNameInput, { target: { value: 'Test'}});
    await waitFor(
        () => expect(form.getByText('Add').closest('button'))
            .not.toHaveAttribute('disabled')
  );
});

it('Update', async () => {
    successAction = undefined;

    const page = render(
      <MemoryRouter>
        <ScratchStorageEditForm
          onSubmit={onSubmit}
          onClose={onClose}
          formActionType={FormActionType.UPDATE}
          isSubmitting={false}
          successAction={successAction}
          data={testValidScratchStorage}
        />
      </MemoryRouter>
    );

    const elem = page.getByTestId('scratch-storage-form');
    expect(elem).toBeInTheDocument();

    // Test client-side validation on App Name
    const appNameInput = page.getByDisplayValue(testValidScratchStorage.appName);

    fireEvent.change(appNameInput, { target: { value: '' } });
    expect(appNameInput).toHaveValue('');
    expect(page.getByText(new RegExp(validationErrors.requiredText)));
    fireEvent.change(appNameInput, { target: { value: 'Test 2' } });
    expect(appNameInput).toHaveValue('Test 2');

    // Implicit Read
    const readCheckbox = page.getByLabelText('Implicit Read');
    fireEvent.click(readCheckbox);
    expect(readCheckbox).toBeChecked();

    // Acl Mode
    const aclCheckbox = page.getByLabelText('ACL Mode');
    fireEvent.click(aclCheckbox);
    expect(aclCheckbox).toBeChecked();

    // Add user
    const addUserBtn = page.getByText('Add User');
    fireEvent.click(addUserBtn);
    const addUserModal = await screen.findByTestId('scratch-storage-add-form');
    expect(addUserModal).toBeInTheDocument()
  });

  it('Should allow adding of emails', async () => {
    successAction = undefined;

    const page = render(
      <MemoryRouter>
        <ScratchStorageEditForm
          onSubmit={onSubmit}
          onClose={onClose}
          formActionType={FormActionType.UPDATE}
          isSubmitting={false}
          successAction={successAction}
          data={testValidScratchStorage}
        />
      </MemoryRouter>
    );

    const elem = page.getByTestId('scratch-storage-form');
    expect(elem).toBeInTheDocument();

    // Test client-side validation on App Name
    const appNameInput = page.getByDisplayValue(testValidScratchStorage.appName);

    fireEvent.change(appNameInput, { target: { value: '' } });
    expect(appNameInput).toHaveValue('');
    expect(page.getByText(new RegExp(validationErrors.requiredText)));
    fireEvent.change(appNameInput, { target: { value: 'Test 2' } });
    expect(appNameInput).toHaveValue('Test 2');

    // Implicit Read
    const readCheckbox = page.getByLabelText('Implicit Read');
    fireEvent.click(readCheckbox);
    expect(readCheckbox).toBeChecked();

    // Add user
    const addUserBtn = page.getByText('Add User');
    fireEvent.click(addUserBtn);
    const addUserModal = await screen.findByTestId('scratch-storage-add-form');
    expect(addUserModal).toBeInTheDocument()

    // enter email
    const emailBox = await page.findByTestId('new-scratch-email-field');
    expect(emailBox).toBeVisible();
    fireEvent.change(emailBox, { target: { value: 'dude@test.com' }});
    const adminCheckbox = await page.findByTestId('scratch-admin');

    // Add
    expect(adminCheckbox).toBeVisible();
    fireEvent.click(adminCheckbox);
    await waitFor(() => expect(adminCheckbox).toBeChecked());
    const addUser = await page.findByTestId('submit-scratch-user-btn');
    fireEvent.click(addUser);

    // Dismiss
    const submitUserBtn = await screen.findByTestId('modal-submit-btn');
    fireEvent.click(submitUserBtn);
    await waitFor(() => expect(addUserModal).not.toBeVisible());

    const deleteCan = await page.findByTestId('delete-cell-renderer');
    await waitFor(() => expect(deleteCan).toBeInTheDocument());
    fireEvent.click(deleteCan);
    await waitFor(() => expect(deleteCan).not.toBeInTheDocument());

  });

it('Has default values if none given', () => {
    successAction = undefined;

    testValidScratchStorage.id = '';
    testValidScratchStorage.appName = '';
    testValidScratchStorage.appHasImplicitRead = undefined;
    testValidScratchStorage.userPrivs = [];

    const page = render(
      <MemoryRouter>
        <ScratchStorageEditForm
          onSubmit={onSubmit}
          onClose={onClose}
          formActionType={FormActionType.UPDATE}
          isSubmitting={false}
          successAction={successAction}
          data={testValidScratchStorage}
        />
      </MemoryRouter>
    );

    expect(page.getByTestId('scratch-storage-form')).toBeInTheDocument();
  });

  it('Shows success', () => {
      successAction = {
        success: true,
        successMsg: 'Success'
      };

      const page = render(
        <MemoryRouter>
          <ScratchStorageEditForm
            onSubmit={onSubmit}
            onClose={onClose}
            formActionType={FormActionType.UPDATE}
            isSubmitting={false}
            successAction={successAction}
            data={testValidScratchStorage}
          />
        </MemoryRouter>
      );

      expect(page.getByText(successAction.successMsg)).toBeInTheDocument();
    });
});