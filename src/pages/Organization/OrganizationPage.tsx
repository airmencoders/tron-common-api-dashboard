import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import { createDefaultGridFilterParamsForType } from '../../components/Grid/GridUtils/grid-utils';
import LoadingCellRenderer from '../../components/LoadingCellRenderer/LoadingCellRenderer';
import { OrganizationDto } from '../../openapi';
import { useOrganizationState } from '../../state/organization/organization-state';
import OrganizationDelete from './OrganizationDelete';
import OrganizationEditForm from './OrganizationEditForm';

const columns: GridColumn[] =
  [
    new GridColumn({
      field: 'id',
      sortable: true,
      filter: true,
      headerName: 'id',
      cellRenderer: LoadingCellRenderer,
      filterParams: createDefaultGridFilterParamsForType('uuid')
    }),
    new GridColumn({
      field: 'name',
      sortable: true,
      filter: true,
      headerName: 'Name'
    }),
    new GridColumn({
      field: 'leader',
      sortable: true,
      filter: true,
      headerName: 'Leader',
      filterParams: createDefaultGridFilterParamsForType('uuid')
    }),
    new GridColumn({
      field: 'parentOrganization',
      sortable: true,
      filter: true,
      headerName: 'Parent Org Id',
      filterParams: createDefaultGridFilterParamsForType('uuid')
    }),
    new GridColumn({
      field: 'orgType',
      sortable: true,
      filter: true,
      headerName: 'Org Type',
      filterParams: createDefaultGridFilterParamsForType('enum')
    }),
    new GridColumn({
      field: 'branchType',
      sortable: true,
      filter: true,
      headerName: 'Branch Type',
      filterParams: createDefaultGridFilterParamsForType('enum')
    }),
  ];

function OrganizationPage() {
  return (
      <DataCrudFormPage<OrganizationDto, OrganizationDto>
        allowEdit={true}
        columns={columns}
        createForm={OrganizationEditForm}
        dataTypeName="Organization"
        pageTitle="Organizations"
        updateForm={OrganizationEditForm}
        useDataState={useOrganizationState}
        allowDelete
        allowAdd
        deleteComponent={OrganizationDelete}
        autoResizeColumns
        autoResizeColummnsMinWidth={1200}
        infiniteScroll={{
          enabled: true
        }}
      />
  );
}

export default OrganizationPage;
