import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import ScratchStorageUserAddForm from '../ScratchStorageUserAddForm';
import { ScratchStorageEditorState } from '../ScratchStorageEditForm';

jest.mock('../../../state/app-source/app-source-state');

describe('Test App Source Endpoint Editor', () => {
  let onSubmit = jest.fn();
  let addEditorState: State<ScratchStorageEditorState> & StateMethodsDestroy;
  let updateEditorState: State<ScratchStorageEditorState> & StateMethodsDestroy;
   

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {});
    addEditorState = createState<ScratchStorageEditorState>({
        isOpen: true,
        data: {
            userId:'',
            email:'',
            read: false,
            write: false,
            admin: false
        },
        original: {
            userId:'',
            email:'',
            read: false,
            write: false,
            admin: false
        },
        errorMessage: ''
    });
    updateEditorState = createState<ScratchStorageEditorState>({
        isOpen: true,
        data: {
            userId:'',
            email:'test@test.com',
            read: false,
            write: true,
            admin: false
        },
        original: {
            userId:'',
            email:'test@test.com',
            read: false,
            write: true,
            admin: false
        },
        errorMessage: ''
    });
  });

  afterEach(() => {
    addEditorState.destroy();
    updateEditorState.destroy();
  });

  it('Add User', async () => {
    const page = render(
        <ScratchStorageUserAddForm
            editorState={addEditorState}
            onSubmit={onSubmit}
        />
   );

    await expect(page.findByTestId('scratch-storage-add-form')).resolves.toBeInTheDocument();
    const emailInput = page.getByDisplayValue(addEditorState.get().data.email);
    await expect(emailInput).toHaveValue('');    

    const addUserButton = page.getByText('Add User');
    expect(addUserButton).toBeInTheDocument()
    expect(addUserButton).toBeDisabled();

    // Read
    const readCheckbox = page.getByLabelText('Read');
    fireEvent.click(readCheckbox);
    expect(readCheckbox).toBeChecked();

    // Write
    const writeCheckbox = page.getByLabelText('Write');
    fireEvent.click(writeCheckbox);
    expect(writeCheckbox).toBeChecked();

    // Admin
    const adminCheckbox = page.getByLabelText('Admin');
    fireEvent.click(adminCheckbox);
    expect(adminCheckbox).toBeChecked();

    expect(addUserButton).toBeDisabled();

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    expect(emailInput).toHaveValue('test@test.com');

    await waitFor(
      () => expect(addUserButton.closest('button')).not.toBeDisabled()
    );
    fireEvent.click(addUserButton);
    expect(onSubmit).toBeCalledTimes(1);
  });

  it('Update User', async () => {
    const page = render(
        <ScratchStorageUserAddForm
            editorState={updateEditorState}
            onSubmit={onSubmit}
            isUpdate
        />
   );

    await expect(page.findByTestId('scratch-storage-add-form')).resolves.toBeInTheDocument();
    const emailInput = page.getByDisplayValue(updateEditorState.get().data.email);
    await expect(emailInput).toHaveValue('test@test.com');    

    const updateUserButton = page.getByText('Update User');
    expect(updateUserButton).toBeInTheDocument()
    expect(updateUserButton).toBeDisabled();

    // Read
    const readCheckbox = page.getByLabelText('Read');
    fireEvent.click(readCheckbox);
    expect(readCheckbox).toBeChecked();

    await waitFor(
      () => expect(updateUserButton.closest('button')).not.toBeDisabled()
    );
    fireEvent.click(updateUserButton);
    expect(onSubmit).toBeCalledTimes(1);
  });
});
