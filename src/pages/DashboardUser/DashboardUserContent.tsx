import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import { DashboardUserFlat } from '../../state/dashboard-user/dashboard-user-flat';
import { useDashboardUserState } from '../../state/dashboard-user/dashboard-user-state';
import { useCrudPageState } from '../../state/crud-page/crud-page-state';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import DashboardUserForm from './DashboardUserForm';
import DashboardUserDeleteForm from './DashboardUserDeleteForm';

const columns: GridColumn[] =
  [
    new GridColumn('id', true, true, 'UUID'),
    new GridColumn('email', true, true, 'Email'),
    new GridColumn('hasDashboardAdmin', true, true, 'Dashboard Admin', 'header-center',
      PrivilegeCellRenderer),
    new GridColumn('hasDashboardUser', true, true, 'Dashboard User', 'header-center',
      PrivilegeCellRenderer),
  ];

export function DashboardUserContent() {
  return (
    <DataCrudFormPage<DashboardUserFlat, DashboardUserFlat>
      columns={columns}
      dataTypeName="Dashboard User"
      pageTitle="Dashboard Users"
      createForm={DashboardUserForm}
      updateForm={DashboardUserForm}
      useDataState={useDashboardUserState}
      usePageState={useCrudPageState}
      allowEdit={true}
      allowDelete
      deleteComponent={DashboardUserDeleteForm}
    />
  )
}