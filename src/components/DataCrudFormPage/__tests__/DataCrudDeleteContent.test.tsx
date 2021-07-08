import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppClientFlat } from '../../../state/app-clients/app-client-flat';
import DataCrudDeleteContent from '../DataCrudDeleteContent';

describe('DataCrudDeleteContent Tests', () => {
  let data: AppClientFlat;
  let fields: Record<string, string>;

  beforeEach(() => {
    data = {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test",
      clusterUrl: ""
    };

    fields = {
      "ID": data.id || 'Unknown',
      "Name": data.name,
    };
  });

  it('Renders', async () => {
    render(
      <MemoryRouter>
        <DataCrudDeleteContent
          dataTypeName="App Client"
          fields={fields}
        />
      </MemoryRouter>
    );

    await waitFor(
      () => expect(screen.getByTestId('data-crud-delete-content')).toBeTruthy()
    );

    // Renders message
    expect(screen.getByText(new RegExp(`Delete this App Client`, 'i'))).toBeInTheDocument();

    // Renders fields
    Object.entries(fields).map(([key, value]) => {
      expect(screen.getByText(key)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
    })
  });
})
