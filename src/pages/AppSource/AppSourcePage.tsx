import React from 'react';
import GridColumn from '../../components/Grid/GridColumn';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import { AppSourceDto } from '../../openapi';
import { useAppSourceState } from '../../state/app-source/app-source-state';

const columnHeaders: GridColumn[] = [
  new GridColumn('id', true, true, 'ID'),
  new GridColumn('name', true, true, 'Name'),
  new GridColumn('clientCount', true, true, 'Client Count')
];

export function AppSourcePage() {
  return (
    <DataCrudFormPage<AppSourceDto, AppSourceDto>
      columns={columnHeaders}
      dataTypeName="App Source"
      pageTitle="App Sources"
      createForm={() => <></>}
      updateForm={() => <></>}
      useDataState={useAppSourceState}
      allowEdit={false}
    />
  )
}