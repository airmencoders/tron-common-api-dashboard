import React from 'react';
import {render, waitFor, screen} from '@testing-library/react';
import Grid from '../Grid';
import GridColumn from '../GridColumn';

test('grid shows rows', async () => {
  const gridData = [
    { field1: 'Field1 val 1', field2: 'Field2 val 1' },
    { field1: 'Field1 val 2', field2: 'Field2 val 2' },
  ];

  const columns = [
    new GridColumn({
      field: 'field1',
      headerName: 'Field 1'
    }),
    new GridColumn({
      field: 'field2',
      headerName: 'Field 2'
    }),
  ];
  render(<Grid data={gridData} columns={columns} />);
  await waitFor(
      () => {
        expect(screen.getByText('Field1 val 1')).toBeTruthy();
        expect(screen.getByText('Field2 val 2')).toBeTruthy();
      }
  );
});
