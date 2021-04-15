import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import PrivilegeCellRenderer from '../../components/PrivilegeCellRenderer/PrivilegeCellRenderer';
import { ScratchStorageAppRegistryDto } from '../../openapi/models';
import { useMyDigitizeAppsState } from '../../state/my-digitize-apps/my-digitize-apps-state';
import { ScratchStorageAppFlat } from '../../state/my-digitize-apps/scratch-storage-app-flat';

const columns: GridColumn[] =
  [
    new GridColumn({
      field: 'appName',
      sortable: true,
      filter: true,
      headerName: 'App Name'
    }),
    new GridColumn({
      field: 'scratchRead',
      sortable: true,
      filter: true,
      headerName: 'Scratch Read',
      headerClass: 'header-center',
      cellRenderer: PrivilegeCellRenderer
    }),
    new GridColumn({
      field: 'scratchWrite',
      sortable: true,
      filter: true,
      headerName: 'Scratch Write',
      headerClass: 'header-center',
      cellRenderer: PrivilegeCellRenderer
    }),
    new GridColumn({
      field: 'scratchAdmin',
      sortable: true,
      filter: true,
      headerName: 'Scratch Admin',
      headerClass: 'header-center',
      cellRenderer: PrivilegeCellRenderer
    }),
  ];

function MyDigitizeAppsPage() {
  return (
    <DataCrudFormPage<ScratchStorageAppFlat, ScratchStorageAppRegistryDto>
      columns={columns}
      dataTypeName="Digitize App"
      pageTitle="My Digitize Apps"
      useDataState={useMyDigitizeAppsState}
      autoResizeColumns
      autoResizeColummnsMinWidth={900}
    />
  );
}

export default MyDigitizeAppsPage;
