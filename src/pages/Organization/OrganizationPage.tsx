import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
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
      headerName: 'id'
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
      headerName: 'Leader'
    }),
    new GridColumn({
      field: 'parentOrganization',
      sortable: true,
      filter: true,
      headerName: 'Parent Org Id'
    }),
    new GridColumn({
      field: 'orgType',
      sortable: true,
      filter: true,
      headerName: 'Org Type'
    }),
    new GridColumn({
      field: 'branchType',
      sortable: true,
      filter: true,
      headerName: 'Branch Type'
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
      />
  );
}

export default OrganizationPage;
