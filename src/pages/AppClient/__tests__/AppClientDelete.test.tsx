import React from 'react';
import { render } from '@testing-library/react';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';
import { AppClientFlat } from '../../../state/app-clients/app-client-flat';
import AppClientDelete from '../AppClientDelete';

describe('Test App Client Delete Component', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let successAction: DataCrudSuccessAction | undefined;
  let data: AppClientFlat;
  let formErrors: DataCrudFormErrors;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    data = {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test",
      read: true,
      write: true
    }

    successAction = {
      success: false,
      successMsg: ''
    };

    formErrors = {
      validation: undefined,
      general: undefined
    }
  });

  it('Renders', async () => {
    successAction = undefined;
    const pageRender = render(
      <AppClientDelete
        data={data}
        formErrors={formErrors}
        successAction={successAction}
        isSubmitting={false}
      />
    );

    expect(pageRender.getByTestId('app-client-delete')).toBeInTheDocument();
    expect(pageRender.getByText(data.id!)).toBeInTheDocument();
    expect(pageRender.getByText(data.name!)).toBeInTheDocument();
  });
})
