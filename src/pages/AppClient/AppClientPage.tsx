import React from 'react';
import GridColumn from '../../components/Grid/GridColumn';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import { AppClientFlat } from '../../state/app-clients/app-client-flat';
import AppClientForm from './AppClientForm';
import AppClientDelete from './AppClientDelete';

const columnHeaders: GridColumn[] = [
  new GridColumn({
    field: 'name',
    sortable: true,
    filter: true,
    headerName: 'Name'
  }),
  new GridColumn({
    field: 'read',
    sortable: true,
    headerName: 'Read',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    field: 'write',
    sortable: true,
    headerName: 'Write',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
];

export function AppClientPage() {
  return (
    <DataCrudFormPage<AppClientFlat, AppClientFlat>
      columns={columnHeaders}
      dataTypeName="App Client"
      pageTitle="App Clients"
      createForm={AppClientForm}
      updateForm={AppClientForm}
      useDataState={useAppClientsState}
      allowEdit={true}
      allowDelete
      allowAdd
      deleteComponent={AppClientDelete}
    />
  )
}