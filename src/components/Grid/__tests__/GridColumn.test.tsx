import React from 'react';
import GridColumn from '../GridColumn';

test('GridColumn field access', () => {
  const gridColumn = new GridColumn(
      'field',
      false,
      false,
      'Header Name'
  );

  expect(gridColumn.field).toBe('field');
  expect(gridColumn.sortable).toBe(false);
  expect(gridColumn.filter).toBe(false);
  expect(gridColumn.headerName).toBe('Header Name');
});
