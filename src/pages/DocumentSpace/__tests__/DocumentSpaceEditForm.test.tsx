import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import DocumentSpaceEditForm from '../DocumentSpaceEditForm';

jest.mock('../../../state/document-space/document-space-state');


describe('Document Space Create/Edit Form Tests', () => {

  it('should render with add button disabled', async () => {
    const cancelFn = jest.fn();
    const page = render(<MemoryRouter>
      <DocumentSpaceEditForm 
        isFormSubmitting={false}
        onSubmit={jest.fn()}
        onCancel={cancelFn}
        formActionType={FormActionType.ADD}
        onCloseErrorMsg={jest.fn()}
      />
      </MemoryRouter>);

      await waitFor(() => expect(page.getByText('Document Space Details')).toBeVisible());
      const submitBtn = page.getByText('Add');
      expect(submitBtn).toBeDisabled();

      const cancelBtn = page.getByText('Cancel');
      fireEvent.click(cancelBtn);
      await waitFor(() => expect(cancelFn).toHaveBeenCalled());
  });

  it('should validate doc space name', async () => {
    const submitFn = jest.fn();

    const page = render(<MemoryRouter>
      <DocumentSpaceEditForm 
        isFormSubmitting={false}
        onSubmit={submitFn}
        onCancel={jest.fn()}
        onCloseErrorMsg={jest.fn()}
        formActionType={FormActionType.ADD}
      />
      </MemoryRouter>);

      await waitFor(() => expect(page.getByText('Document Space Details')).toBeVisible());
      const nameField = page.getByTestId('new-space-name-field');
      fireEvent.change(nameField, { target: { value: 'ab'}})
      const submitBtn = page.getByText('Add');
      await waitFor(() => expect(submitBtn).toBeDisabled());
      fireEvent.change(nameField, { target: { value: 'abcdefg'}});
      await waitFor(() => expect(submitBtn).not.toBeDisabled());

      fireEvent.click(submitBtn);
      await waitFor(() => expect(submitFn).toHaveBeenCalled());

  });
});