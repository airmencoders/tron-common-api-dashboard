import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import DocumentSpaceCreateEditFolderForm from '../DocumentSpaceCreateEditFolderForm';
import { MemoryRouter } from 'react-router';
import { waitFor } from '@testing-library/dom';


describe('Doc Space Create Edit form test', () => {

  it('allows creation of new folder', async () => {
    const mockSubmit = jest.fn();
    const mockClose = jest.fn();
    const props = {
      folderName: '',
      onSubmit: mockSubmit,
      onCancel: mockClose,
      isFormSubmitting: false,
      formActionType: FormActionType.ADD,
      onCloseErrorMsg: jest.fn()
    };

    const page = render(
      <MemoryRouter>
        <DocumentSpaceCreateEditFolderForm {...props} />
      </MemoryRouter>);

    const inputElem = page.getByTestId('foldername-name-field');
    await waitFor(() => expect(inputElem).toBeVisible());
    fireEvent.click(page.getByText('Add'));
    await waitFor(() => expect(mockSubmit).not.toHaveBeenCalled());

    fireEvent.change(inputElem, { target: { value: 'invalid%^name' }});
    fireEvent.click(page.getByText('Add'));
    await waitFor(() => expect(mockSubmit).not.toHaveBeenCalled());

    fireEvent.change(inputElem, { target: { value: 'folder1' }});
    fireEvent.click(page.getByText('Add'));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
  });

  it('allows renaming of an existing folder', async () => {
    const mockSubmit = jest.fn();
    const mockClose = jest.fn();
    const props = {
      folderName: 'existing-folder',
      onSubmit: mockSubmit,
      onCancel: mockClose,
      isFormSubmitting: false,
      formActionType: FormActionType.ADD,
      onCloseErrorMsg: jest.fn()
    };

    const page = render(
      <MemoryRouter>
        <DocumentSpaceCreateEditFolderForm {...props} />
      </MemoryRouter>);

    const inputElem = page.getByDisplayValue('existing-folder');
    await waitFor(() => expect(inputElem).toBeVisible());
    fireEvent.click(page.getByText('Add'));
    await waitFor(() => expect(mockSubmit).not.toHaveBeenCalled());

    fireEvent.change(inputElem, { target: { value: 'existing-folder2' }});
    fireEvent.click(page.getByText('Add'));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
  });
});