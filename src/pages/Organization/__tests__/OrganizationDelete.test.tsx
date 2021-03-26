import React from 'react';
import { render } from '@testing-library/react';
import OrganizationDelete from '../OrganizationDelete';
import { OrganizationDto } from '../../../openapi';

describe('Test App Client Delete Component', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let data: OrganizationDto;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    data = {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test Org"
    }
  });

  it('Renders', () => {
    const pageRender = render(
      <OrganizationDelete
        data={data}
        dataTypeName="Organization"
      />
    );

    expect(pageRender.getByTestId('data-crud-delete-content')).toBeInTheDocument();
    expect(pageRender.getByText(data.id!)).toBeInTheDocument();
    expect(pageRender.getByText(data.name!)).toBeInTheDocument();
  });
})
