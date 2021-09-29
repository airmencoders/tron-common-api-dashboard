import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { DashboardUserFlat } from '../../state/dashboard-user/dashboard-user-flat';
import { useDashboardUserState } from '../../state/dashboard-user/dashboard-user-state';
import DashboardUserDelete from './DashboardUserDelete';
import DashboardUserForm from './DashboardUserForm';
import {DashboardUserDto} from '../../openapi/models';

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
    headerName: 'Admin',
    headerClass: 'header-center',
    cellRenderer: PrivilegeCellRenderer
  }),
];

function DashboardUserPage() {
  return (
    <DataCrudFormPage<DashboardUserFlat, DashboardUserDto>
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
