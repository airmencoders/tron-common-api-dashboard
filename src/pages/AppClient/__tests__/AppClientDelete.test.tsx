import React from 'react';
import { render } from '@testing-library/react';
import { AppClientFlat } from '../../../state/app-clients/app-client-flat';
import AppClientDelete from '../AppClientDelete';

describe('Test App Client Delete Component', () => {
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
      clusterUrl: ""
    }
  });

  it('Renders', () => {
    const pageRender = render(
      <AppClientDelete
        data={data}
        dataTypeName="App Client"
      />
    );

    expect(pageRender.getByTestId('data-crud-delete-content')).toBeInTheDocument();
    expect(pageRender.getByText(data.id!)).toBeInTheDocument();
    expect(pageRender.getByText(data.name!)).toBeInTheDocument();
  });
})
