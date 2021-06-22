import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { SideDrawerSize } from '../../components/SideDrawer/side-drawer-size';
import { AppClientFlat } from '../../state/app-clients/app-client-flat';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import { accessAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { PrivilegeType } from '../../state/privilege/privilege-type';
import AppClientDelete from './AppClientDelete';
import AppClientForm from './AppClientForm';

const columnHeaders: GridColumn[] = [
  new GridColumn({
    field: 'name',
    sortable: true,
    filter: true,
    headerName: 'Name'
  }),
  new GridColumn({
    field: 'personCreate',
    sortable: true,
    headerName: 'Create Person',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    field: 'personEdit',
    sortable: true,
    headerName: 'Edit Person',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    field: 'personDelete',
    sortable: true,
    headerName: 'Delete Person',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    field: 'orgCreate',
    sortable: true,
    headerName: 'Create Org',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    field: 'orgEdit',
    sortable: true,
    headerName: 'Edit Org',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    field: 'orgDelete',
    sortable: true,
    headerName: 'Delete Org',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
];

const currentUser = accessAuthorizedUserState();

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
      allowDelete={currentUser.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)}
      allowAdd={currentUser.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)}
      deleteComponent={AppClientDelete}
      autoResizeColumns
      autoResizeColummnsMinWidth={700}
      sideDrawerSize={SideDrawerSize.WIDE}
    />
  )
}
