import React from 'react';
import GridColumn from '../../components/Grid/GridColumn';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import { AppSourceDetailsDto, AppSourceDto } from '../../openapi';
import { useAppSourceState } from '../../state/app-source/app-source-state';
import AppSourceForm from './AppSourceForm';

const columnHeaders: GridColumn[] = [
  new GridColumn({
    field: 'id',
    sortable: true,
    filter: true,
    headerName: 'ID'
  }),
  new GridColumn({
    field: 'name',
    sortable: true,
    filter: true,
    headerName: 'Name'
  }),
  new GridColumn({
    field: 'clientCount',
    sortable: true,
    filter: true,
    headerName: 'Client Count'
  }),
  new GridColumn({
    field: 'endpointCount',
    sortable: true,
    filter: true,
    headerName: 'Endpoint Count'
  })
];

export function AppSourcePage() {
  return (
    <DataCrudFormPage<AppSourceDto, AppSourceDetailsDto>
      columns={columnHeaders}
      dataTypeName="App Source"
      pageTitle="App Sources"
      updateForm={AppSourceForm}
      useDataState={useAppSourceState}
      allowEdit={true}
      autoResizeColumns
      autoResizeColummnsMinWidth={800}
    />
  )
}