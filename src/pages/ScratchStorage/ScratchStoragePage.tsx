import React from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import {ScratchStorageAppRegistryDto} from '../../openapi/models';
import { ScratchStorageFlat } from '../../state/scratch-storage/scratch-storage-flat';
import { useScratchStorageState } from '../../state/scratch-storage/scratch-storage-state';
import ScratchStorageDelete from './ScratchStorageDelete';
import ScratchStorageEditForm from './ScratchStorageEditForm';

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
    })
  ];

function ScratchStoragePage() {
  return (
      <DataCrudFormPage<ScratchStorageAppRegistryDto, ScratchStorageFlat>
          columns={columns}
          createForm={ScratchStorageEditForm}
          dataTypeName="Scratch Storage App"
          pageTitle="Scratch Storage Apps"
          updateForm={ScratchStorageEditForm}
          useDataState={useScratchStorageState}
          allowEdit={true}
          allowDelete
          deleteComponent={ScratchStorageDelete}
          allowAdd
      />
  );
}

export default ScratchStoragePage;
