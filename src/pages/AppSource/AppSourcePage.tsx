import React from 'react';
import GridColumn from '../../components/Grid/GridColumn';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import { AppSourceDto } from '../../openapi';
import { useAppSourceState } from '../../state/app-source/app-source-state';
import { AppSourceDetailsFlat } from '../../state/app-source/app-source-details-flat';
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
  })
];

export function AppSourcePage() {
  return (
    <DataCrudFormPage<AppSourceDto, AppSourceDetailsFlat>
      columns={columnHeaders}
      dataTypeName="App Source"
      pageTitle="App Sources"
      createForm={() => <></>}
      updateForm={AppSourceForm}
      useDataState={useAppSourceState}
      allowEdit={true}
    />
  )
}