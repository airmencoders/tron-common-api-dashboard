import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppSourceForm from '../AppSourceForm';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { AppSourceDetailsFlat } from '../../../state/app-source/app-source-details-flat';

describe('Test App Source Form', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let successAction: DataCrudSuccessAction | undefined;
  let appSourceDetailsFlat: AppSourceDetailsFlat;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    successAction = {
      success: false,
      successMsg: ''
    };

    appSourceDetailsFlat = {
      id: 'dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8',
      name: 'test',
      appClients: [
        {
          appClientUser: 'App Client User ID',
          appClientUserName: 'App Client Name',
          read: false,
          write: false
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
          data={appSourceDetailsFlat}
        />
      </MemoryRouter>
    );

    const elem = page.getByTestId('app-source-form');
    expect(elem).toBeInTheDocument();

    const nameInput = page.getByDisplayValue(appSourceDetailsFlat.name);

    // Test client-side validation
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(nameInput).toHaveValue('');
    expect(page.getByText('* cannot be empty or blank.'));

    fireEvent.change(nameInput, { target: { value: 'Test 2' } });
    expect(nameInput).toHaveValue('Test 2');

    fireEvent.click(page.getByText('Update'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

});
