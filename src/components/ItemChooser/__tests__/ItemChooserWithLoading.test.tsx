import React from 'react';
import { render } from '@testing-library/react';
import ItemChooserWithLoading from '../ItemChooserWithLoading';
import GridColumn from '../../Grid/GridColumn';

test('Loading state shown', async () => {
  const items = [
    {
      name: 'test'
    }
  ];

  const columns = [
    new GridColumn({
      field: 'name',
      headerName: 'Name'
    })
  ]

  const component = render(
    <ItemChooserWithLoading
      isLoading={true}
      columns={columns}
      items={items}
      onRowClicked={() => { return; }}
    />
  );

  await expect(component.findByText('Loading...')).resolves.toBeInTheDocument();
});

