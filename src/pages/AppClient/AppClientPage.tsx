import React, { useEffect } from 'react';
import GridColumn from '../../components/Grid/GridColumn';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import { usePrivilegeState } from '../../state/privilege/privilege-state';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import { AppClientFlat } from '../../state/app-clients/interface/app-client-flat';
import AppClientForm from './AppClientForm';
import { useCrudPageState } from '../../state/crud-page/crud-page-state';
import AppClientDelete from './AppClientDelete';

const columnHeaders: GridColumn[] = [
  new GridColumn('name', true, true, 'NAME'),
  new GridColumn('read', true, false, 'READ', 'header-center',
      PrivilegeCellRenderer),
  new GridColumn('write', true, false, 'WRITE', 'header-center',
      PrivilegeCellRenderer),
];

export function AppClientPage() {
  const privilegeState = usePrivilegeState();

  useEffect(() => {
    privilegeState.fetchAndStorePrivileges();
  }, []);

  return (
    <DataCrudFormPage<AppClientFlat, AppClientFlat>
      columns={columnHeaders}
      dataTypeName="App Client"
      pageTitle="App Clients"
      createForm={AppClientForm}
      updateForm={AppClientForm}
      useDataState={useAppClientsState}
      usePageState={useCrudPageState}
      allowEdit={true}
      allowDelete
      deleteComponent={AppClientDelete}
    />
  )
}