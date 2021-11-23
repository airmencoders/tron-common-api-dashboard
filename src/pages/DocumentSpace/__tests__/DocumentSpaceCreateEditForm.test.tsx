import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import DocumentSpaceCreateEditForm, { DocumentSpaceCreateEditFormProps } from '../DocumentSpaceCreateEditForm';
import { MemoryRouter } from 'react-router';
import { waitFor } from '@testing-library/dom';
import { CreateEditOperationType } from '../../../state/document-space/document-space-utils';


describe('Doc Space Create Edit form test', () => {

  it('allows creation of new folder', async () => {
    const mockSubmit = jest.fn();
    const mockClose = jest.fn();
    const props: DocumentSpaceCreateEditFormProps = {
      elementName: '',
      onSubmit: mockSubmit,
      onCancel: mockClose,
      isFormSubmitting: false,
      opType: CreateEditOperationType.CREATE_FOLDER,
      onCloseErrorMsg: jest.fn()
    };

    const page = render(
      <MemoryRouter>
        <DocumentSpaceCreateEditForm {...props} />
      </MemoryRouter>);

    const inputElem = page.getByTestId('element-name-field');
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
    const props: DocumentSpaceCreateEditFormProps = {
      elementName: 'existing-folder',
      onSubmit: mockSubmit,
      onCancel: mockClose,
      isFormSubmitting: false,
      opType: CreateEditOperationType.EDIT_FOLDERNAME,
      onCloseErrorMsg: jest.fn()
    };

    const page = render(
      <MemoryRouter>
        <DocumentSpaceCreateEditForm {...props} />
      </MemoryRouter>);

    const inputElem = page.getByDisplayValue('existing-folder');
    await waitFor(() => expect(inputElem).toBeVisible());
    fireEvent.click(page.getByText('Update'));
    await waitFor(() => expect(mockSubmit).not.toHaveBeenCalled());

    fireEvent.change(inputElem, { target: { value: 'existing-folder2' }});
    fireEvent.click(page.getByText('Update'));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
  });

  it('allows renaming of an existing file', async () => {
    const mockSubmit = jest.fn();
    const mockClose = jest.fn();
    const props: DocumentSpaceCreateEditFormProps = {
      elementName: 'existing-file',
      onSubmit: mockSubmit,
      onCancel: mockClose,
      isFormSubmitting: false,
      opType: CreateEditOperationType.EDIT_FILENAME,
      onCloseErrorMsg: jest.fn()
    };

    const page = render(
      <MemoryRouter>
        <DocumentSpaceCreateEditForm {...props} />
      </MemoryRouter>);

    const inputElem = page.getByDisplayValue('existing-file');
    await waitFor(() => expect(inputElem).toBeVisible());
    fireEvent.click(page.getByText('Update'));
    await waitFor(() => expect(mockSubmit).not.toHaveBeenCalled());

    fireEvent.change(inputElem, { target: { value: 'existing-file2' }});
    fireEvent.click(page.getByText('Update'));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
  });
});