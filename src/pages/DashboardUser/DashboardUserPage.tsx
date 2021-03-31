import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { DashboardUserFlat } from '../../state/dashboard-user/dashboard-user-flat';
import { useDashboardUserState } from '../../state/dashboard-user/dashboard-user-state';
import DashboardUserDelete from './DashboardUserDelete';
import DashboardUserForm from './DashboardUserForm';

const columns: GridColumn[] = [
  new GridColumn({
    field: 'id',
    sortable: true,
    filter: true,
    headerName: 'UUID'
  }),
  new GridColumn({
    field: 'email',
    sortable: true,
    filter: true,
    headerName: 'Email'
  }),
  new GridColumn({
    field: 'hasDashboardAdmin',
    sortable: true,
    filter: true,
    headerName: 'Dashboard Admin',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
  new GridColumn({
    field: 'hasDashboardUser',
    sortable: true,
    filter: true,
    headerName: 'Dashboard User',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
];

function DashboardUserPage() {
  return (
    <DataCrudFormPage<DashboardUserFlat, DashboardUserFlat>
      columns={columns}
      dataTypeName='Dashboard User'
      pageTitle='Dashboard Users'
      createForm={DashboardUserForm}
      updateForm={DashboardUserForm}
      useDataState={useDashboardUserState}
      allowEdit={true}
      allowDelete
      allowAdd
      deleteComponent={DashboardUserDelete}
      autoResizeColumns
      autoResizeColummnsMinWidth={1200}
    />
  )
}

export default DashboardUserPage;