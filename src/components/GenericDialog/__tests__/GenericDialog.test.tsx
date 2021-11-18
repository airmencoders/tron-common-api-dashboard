import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import GenericDialog from '../GenericDialog';

describe('DataCrudDelete Tests', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {});

    onClose = jest.fn().mockImplementation(() => {});
  });

  it('Renders', async () => {
    render(
      <MemoryRouter>
        <GenericDialog
          onSubmit={onSubmit}
          onCancel={onClose}
          disableSubmit={false}
          show={true}
          content="Hello"
          title="Dialog"
          submitText="Send It"
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Dialog')).toBeTruthy());
    expect(screen.getByText('Send It')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Send It'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  
});
