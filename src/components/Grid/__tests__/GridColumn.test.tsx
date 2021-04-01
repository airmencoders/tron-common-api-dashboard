import React from 'react';
import GridColumn from '../GridColumn';

test('GridColumn field access', () => {
  const gridColumn = new GridColumn({
    field: 'field',
    headerName: 'Header Name'
  });

  expect(gridColumn.field).toBe('field');
  expect(gridColumn.sortable).toBe(false);
  expect(gridColumn.filter).toBe(false);
  expect(gridColumn.headerName).toBe('Header Name');
});

test('GridColumn default fields', () => {
  const gridColumn = new GridColumn({});

  expect(gridColumn.field).toBe('');
  expect(gridColumn.sortable).toBe(false);
  expect(gridColumn.filter).toBe(false);
  expect(gridColumn.headerName).toBe('');
  expect(gridColumn.headerClass).toBe('');
});
