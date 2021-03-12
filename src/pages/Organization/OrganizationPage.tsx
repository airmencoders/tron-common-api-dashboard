import React from 'react';
import { DataCrudFormPage } from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import { OrganizationDto } from '../../openapi';
import { useCrudPageState } from '../../state/crud-page/crud-page-state';
import { useOrganizationState } from '../../state/organization/organization-state';
import OrganizationDelete from './OrganizationDelete';
import OrganizationEditForm from './OrganizationEditForm';

const columns: GridColumn[] =
    [
      new GridColumn('id', true, true, 'id'),
      new GridColumn('name', true, true, 'Name'),
      new GridColumn('leader', true, true, 'Leader'),
      new GridColumn('parentOrganization', true, true, 'Parent Org Id'),
      new GridColumn('orgType', true, true, 'Org Type'),
      new GridColumn('branchType', true, true, 'Branch Type'),
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
        usePageState={useCrudPageState}
        allowDelete
        deleteComponent={OrganizationDelete}
      />
  );
}

export default OrganizationPage;
