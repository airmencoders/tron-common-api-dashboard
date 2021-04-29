import React from 'react';
import { render } from '@testing-library/react';
import ScratchStorageDelete from '../ScratchStorageDelete';
import { ScratchStorageAppRegistryDto } from '../../../openapi';

describe('Test App Client Delete Component', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let data: ScratchStorageAppRegistryDto;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    data = {
        id: 'fa85f64-5717-4562-b3fc-2c963f66afa6',
        appName: 'Test App Name',
        appHasImplicitRead: true,
        userPrivs: [
            {
                userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                emailAddress: 'test@test.com',
                privs: [
                    {
                        userPrivPairId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        priv: {
                            id: 0,
                            name: "string"
                        }
                    }
                ]
            }
        ]
    };
  });

  it('Renders', () => {
    const pageRender = render(
      <ScratchStorageDelete
        data={data}
        dataTypeName="Scratch Storage App"
      />
    );

    expect(pageRender.getByTestId('scratch-storage-delete')).toBeInTheDocument();
    expect(pageRender.getByText(data.id!)).toBeInTheDocument();
    expect(pageRender.getByText(data.appName!)).toBeInTheDocument();
  });
})
