import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DataCrudDelete from '../DataCrudDelete';
import { AppClientFlat } from '../../../state/app-clients/app-client-flat';
import { DataCrudFormErrors } from '../data-crud-form-errors';

describe('DataCrudDelete Tests', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let data: AppClientFlat;

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
    };
  });

  const TestComponent = () => {
    return (
      <div data-testid="test-delete-component">
        <div>Rendered</div>
      </div>
    );
  }

  it('Renders', async () => {
    render(
      <MemoryRouter>
        <DataCrudDelete
          data={data}
          onSubmit={onSubmit}
          onCancel={onClose}
          dataTypeName="App Client"
          disableSubmit={false}
          show={true}
          deleteComponent={TestComponent}
        />
      </MemoryRouter>
    );

    await waitFor(
      () => expect(screen.getByTestId('test-delete-component')).toBeTruthy()
    );

    expect(screen.getByText('Rendered')).toBeInTheDocument();
  });

  it('Renders errors', async () => {
    const errors: DataCrudFormErrors = {
      general: "A general error"
    };

    render(
      <MemoryRouter>
        <DataCrudDelete
          data={data}
          onSubmit={onSubmit}
          onCancel={onClose}
          dataTypeName="App Client"
          disableSubmit={false}
          show={true}
          deleteComponent={TestComponent}
          errors={errors}
        />
      </MemoryRouter>
    );

    await waitFor(
      () => expect(screen.getByTestId('test-delete-component')).toBeTruthy()
    );

    expect(screen.queryByText(new RegExp(errors.general!, "i"))).toBeInTheDocument();
  });
})
