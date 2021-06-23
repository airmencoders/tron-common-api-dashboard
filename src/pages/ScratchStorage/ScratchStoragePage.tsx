import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { SideDrawerSize } from '../../components/SideDrawer/side-drawer-size';
import { ScratchStorageAppRegistryDto } from '../../openapi/models';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { PrivilegeType } from '../../state/privilege/privilege-type';
import { ScratchStorageFlat } from '../../state/scratch-storage/scratch-storage-flat';
import { useScratchStorageState } from '../../state/scratch-storage/scratch-storage-state';
import ScratchStorageDelete from './ScratchStorageDelete';
import ScratchStorageEditForm from './ScratchStorageEditForm';
import './ScratchStoragePage.scss';

const columns: GridColumn[] =
  [
    new GridColumn({
      field: 'id',
      sortable: true,
      filter: true,
      headerName: 'id'
    }),
    new GridColumn({
      field: 'appName',
      sortable: true,
      filter: true,
      headerName: 'App Name'
    }),
    new GridColumn({
      field: 'appHasImplicitRead',
      sortable: true,
      headerName: 'Implicit Read',
      headerClass: 'header-center',
      cellRenderer: PrivilegeCellRenderer
    })
  ];

function ScratchStoragePage() {
  return (
      <DataCrudFormPage<ScratchStorageAppRegistryDto, ScratchStorageFlat>
          className="scratch-storage-page"
          columns={columns}
          createForm={ScratchStorageEditForm}
          dataTypeName="Scratch Storage App"
          pageTitle="Scratch Storage Apps"
          updateForm={ScratchStorageEditForm}
          useDataState={useScratchStorageState}
          allowEdit={true}
          allowDelete={useAuthorizedUserState().authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)}
          deleteComponent={ScratchStorageDelete}
          allowAdd={useAuthorizedUserState().authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)}
          autoResizeColumns
          autoResizeColummnsMinWidth={800}
          sideDrawerSize={SideDrawerSize.WIDE}
      />
  );
}

export default ScratchStoragePage;
